import React, { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { useSocket } from "../hooks/useSocket";
import { Point, ServerToClient, Stroke } from "../model/socketModel";

const DPR = () => window.devicePixelRatio || 1;

export default function CanvasBoard({ roomId }: { roomId: string }) {
  const { socket, send } = useSocket(); // expose socket per earlier fix
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#222");
  const [width, setWidth] = useState(3);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef<{ active: boolean; points: Point[] }>({
    active: false,
    points: [],
  });

  // resize for DPR
  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const resize = () => {
      const rect = c.getBoundingClientRect();
      const dpr = DPR();
      c.width = Math.floor(rect.width * dpr);
      c.height = Math.floor(rect.height * dpr);
      ctx.scale(dpr, dpr);
      redrawAll();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // listen server → apply strokes or sync
  useEffect(() => {
    const onMsg = (m: ServerToClient) => {
      if (m.type === "sync" && m.roomId === roomId) {
        strokesRef.current = m.strokes.slice();
        redrawAll();
      }
      if (m.type === "stroke" && m.stroke.roomId === roomId) {
        strokesRef.current.push(m.stroke);
        drawStroke(m.stroke);
      }
    };
    socket.on("msg", onMsg);
    return () => void socket.off("msg", onMsg);
  }, [socket, roomId]);

  // join room
  useEffect(() => {
    send({ type: "join", roomId });
    return () => void send({ type: "leave" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // pointer events
  const toPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawingRef.current = { active: true, points: [toPoint(e)] };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current.active) return;
    const pts = drawingRef.current.points;
    const p = toPoint(e);
    const last = pts[pts.length - 1];
    if (!last || last.x !== p.x || last.y !== p.y) {
      pts.push(p);
      // draw preview segment to keep UI responsive
      const s: Stroke = {
        id: "preview",
        roomId,
        color,
        width,
        points: pts.slice(-2),
        ts: Date.now(),
      };
      drawStroke(s);
    }
  };

  const onPointerUp = () => {
    if (!drawingRef.current.active) return;
    const pts = drawingRef.current.points;
    drawingRef.current.active = false;
    if (pts.length < 2) return;

    const stroke: Stroke = {
      id: uuid(),
      roomId,
      color,
      width,
      points: pts,
      ts: Date.now(),
    };
    // draw final locally and store
    strokesRef.current.push(stroke);
    drawStroke(stroke);
    // send once per press end
    send({ type: "stroke", stroke });
  };

  // drawing helpers
  function ctx2d() {
    return canvasRef.current!.getContext("2d")!;
  }

  function drawStroke(s: Stroke) {
    const ctx = ctx2d();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.width;
    ctx.beginPath();
    const [p0, ...rest] = s.points;
    ctx.moveTo(p0.x, p0.y);
    for (const p of rest) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function redrawAll() {
    const c = canvasRef.current!;
    const ctx = ctx2d();
    ctx.clearRect(0, 0, c.width, c.height);
    for (const s of strokesRef.current) drawStroke(s);
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <input
          type="range"
          min={1}
          max={20}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
        />
        <span>{width}px</span>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: 500,
          border: "1px solid #ccc",
          touchAction: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      />
    </div>
  );
}
