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

export type ClientToServer =
  | { type: "join"; roomId: string }
  | { type: "leave" }
  | { type: "event"; roomId: string; payload: unknown }
  | { type: "clear"; roomId: string }
  | { type: "stroke"; stroke: Stroke }; // << send on press end

export type ServerToClient =
  | { type: "hello"; id: string }
  | { type: "joined"; roomId: string }
  | { type: "left"; roomId?: string }
  | { type: "presence"; roomId: string; count: number }
  | { type: "event"; roomId: string; from: string; payload: unknown }
  | { type: "stroke"; stroke: Stroke }
  | { type: "sync"; roomId: string; strokes: Stroke[] }
  | { type: "clear"; roomId: string }
  | { type: "error"; message: string };
