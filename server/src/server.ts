import { createServer } from "node:http";
import { Server } from "socket.io";

// ---- Basic config ----
const PORT = Number(process.env.PORT ?? 3001);
const ORIGIN = process.env.CORS_ORIGIN ?? "*"; // set to your web app origin in prod

// shared
export type Point = { x: number; y: number };
export type Stroke = {
  id: string; // uuid on client
  roomId: string;
  color: string;
  width: number;
  points: Point[]; // collected during a press
  ts: number;
};

// ---- Spin up Socket.IO on a bare HTTP server ----
const httpServer = createServer((_, res) => {
  // optional tiny healthcheck
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ ok: true, rooms: [...rooms.keys()] }));
});

const io = new Server(httpServer, {
  cors: { origin: ORIGIN },
  path: "/socket.io", // default; customize if you want
});

// ---- Minimal in-memory lobby state ----
// Socket.IO has rooms, but we keep a tiny map for fast presence counts.
const rooms = new Map<string, Set<string>>(); // roomId -> socketIds

function joinRoom(socketId: string, roomId: string) {
  console.log("new join", socketId, roomId);
  let set = rooms.get(roomId);
  if (!set) {
    set = new Set<string>();
    rooms.set(roomId, set);
  }
  set.add(socketId);
  return set.size;
}

function leaveRoom(socketId: string, roomId: string) {
  const set = rooms.get(roomId);
  if (!set) return 0;
  set.delete(socketId);
  if (set.size === 0) rooms.delete(roomId);
  return set.size;
}

// server additions
const strokesByRoom = new Map<string, Stroke[]>(); // roomId -> strokes
const MAX_STROKES = 5000; // cap history

function pushStroke(s: Stroke) {
  const list = strokesByRoom.get(s.roomId) ?? [];
  list.push(s);
  if (list.length > MAX_STROKES) list.shift();
  strokesByRoom.set(s.roomId, list);
}

// ---- Socket events & typing ----
type ClientToServer =
  | { type: "join"; roomId: string }
  | { type: "leave" }
  | { type: "event"; roomId: string; payload: unknown }
  | { type: "stroke"; stroke: Stroke };

type ServerToClient =
  | { type: "hello"; id: string }
  | { type: "joined"; roomId: string }
  | { type: "left"; roomId?: string }
  | { type: "presence"; roomId: string; count: number }
  | { type: "event"; roomId: string; from: string; payload: unknown }
  | { type: "stroke"; stroke: Stroke }
  | { type: "sync"; roomId: string; strokes: Stroke[] }
  | { type: "error"; message: string };

io.on("connection", (socket) => {
  // track a single active room per socket (simple lobby semantics)
  socket.data.currentRoom = null as string | null;

  const send = (msg: ServerToClient) => socket.emit("msg", msg);

  send({ type: "hello", id: socket.id });

  socket.on("msg", (raw: ClientToServer) => {
    try {
      switch (raw.type) {
        case "join": {
          const { roomId } = raw;
          if (typeof roomId !== "string" || roomId.length === 0) {
            send({ type: "error", message: "Invalid roomId" });
            return;
          }

          {
            const list = strokesByRoom.get(roomId) ?? [];
            socket.emit("msg", { type: "sync", roomId, strokes: list });
          }

          // leave previous room if any
          if (socket.data.currentRoom) {
            const prev = socket.data.currentRoom;
            socket.leave(prev);
            const count = leaveRoom(socket.id, prev);
            io.to(prev).emit("msg", { type: "presence", roomId: prev, count });
          }

          socket.join(roomId);
          const count = joinRoom(socket.id, roomId);
          socket.data.currentRoom = roomId;

          send({ type: "joined", roomId });
          io.to(roomId).emit("msg", { type: "presence", roomId, count });
          break;
        }

        case "leave": {
          const roomId = socket.data.currentRoom;
          if (!roomId) {
            send({ type: "left" });
            return;
          }
          socket.leave(roomId);
          const count = leaveRoom(socket.id, roomId);
          socket.data.currentRoom = null;

          send({ type: "left", roomId });
          io.to(roomId).emit("msg", { type: "presence", roomId, count });
          break;
        }

        case "event": {
          const { roomId, payload } = raw;
          console.log("get event payload", payload, "and room id", roomId);

          if (!roomId || roomId !== socket.data.currentRoom) {
            send({ type: "error", message: "Not in that room" });
            return;
          }
          io.to(roomId).emit("msg", {
            type: "event",
            roomId,
            from: socket.id,
            payload,
          });
          break;
        }

        case "stroke": {
          const s = raw.stroke;
          // cheap validation
          if (
            !s ||
            s.roomId !== socket.data.currentRoom ||
            !Array.isArray(s.points) ||
            s.points.length < 2
          ) {
            send({ type: "error", message: "Bad stroke" });
            return;
          }
          console.log(`receive stroke ${raw.stroke.color}`);
          pushStroke(s);
          io.to(s.roomId).emit("msg", { type: "stroke", stroke: s });
          break;
        }
      }
    } catch {
      send({ type: "error", message: "Malformed message" });
    }
  });

  socket.on("disconnect", () => {
    const roomId: string | null = socket.data.currentRoom;
    if (!roomId) return;
    const count = leaveRoom(socket.id, roomId);
    io.to(roomId).emit("msg", { type: "presence", roomId, count });
  });
});

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Socket.IO server listening on :${PORT}`);
});
