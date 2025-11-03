import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSocket } from "./useSocket";
import type { ServerToClient } from "./types";

export default function App() {
  const { connected, socketId, send } = useSocket();
  const [roomId, setRoomId] = useState("lobby-1");
  const [presence, setPresence] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const onMsgRef = useRef((m: ServerToClient) => {
    switch (m.type) {
      case "presence":
        if (m.roomId === roomId) setPresence(m.count);
        break;
      case "event":
        if (m.roomId === roomId)
          pushLog(`event from ${m.from}: ${JSON.stringify(m.payload)}`);
        break;
      case "joined":
        pushLog(`joined ${m.roomId}`);
        break;
      case "left":
        pushLog(`left ${m.roomId ?? ""}`);
        break;
      case "hello":
        // socketId handled in hook; keep log for visibility
        pushLog(`hello ${m.id}`);
        break;
      case "error":
        pushLog(`error: ${m.message}`);
        break;
    }
  });

  function pushLog(s: string) {
    setLog((prev) => {
      const next = [...prev, s];
      // cap log size to avoid runaway growth in dev
      if (next.length > 500) next.shift();
      return next;
    });
  }

  const subscribe = useMemo(() => {
    return (e: MessageEvent) => {};
  }, []);

  // join on mount or when roomId changes
  useEffect(() => {
    send({ type: "join", roomId });
    // leave on unmount
    return () => void send({ type: "leave" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const sendMove = (move: string) => {
    send({ type: "event", roomId, payload: { move, t: Date.now() } });
  };

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        margin: 24,
        lineHeight: 1.4,
      }}
    >
      <h1>Socket.IO Lobby</h1>
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <StatusDot on={connected} />
        <div>Socket: {socketId ?? "…"}</div>
        <div>
          Room:&nbsp;
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            style={{ padding: 6, fontFamily: "inherit" }}
          />
          <button
            onClick={() => send({ type: "join", roomId })}
            style={{ marginLeft: 8, padding: "6px 10px" }}
          >
            Join
          </button>
          <button
            onClick={() => send({ type: "leave" })}
            style={{ marginLeft: 8, padding: "6px 10px" }}
          >
            Leave
          </button>
        </div>
        <div>Players present: {presence}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={() => sendMove("A2->A3")}
          style={{ padding: "6px 10px" }}
        >
          Send move A2→A3
        </button>
      </div>

      <h2 style={{ marginTop: 24 }}>Log</h2>
      <pre
        style={{
          background: "#111",
          color: "#ddd",
          padding: 12,
          borderRadius: 6,
          maxHeight: 300,
          overflow: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {log.join("\n")}
      </pre>
    </div>
  );
}

function StatusDot({ on }: { on: boolean }) {
  return (
    <span
      title={on ? "connected" : "disconnected"}
      style={{
        width: 10,
        height: 10,
        display: "inline-block",
        borderRadius: "50%",
        background: on ? "#38c172" : "#e3342f",
        boxShadow: "0 0 0 2px #0002",
      }}
    />
  );
}
