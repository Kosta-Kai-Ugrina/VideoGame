// types.ts
export type ClientToServer =
  | { type: "join"; roomId: string }
  | { type: "leave" }
  | { type: "event"; roomId: string; payload: unknown };

export type ServerToClient =
  | { type: "hello"; id: string }
  | { type: "joined"; roomId: string }
  | { type: "left"; roomId?: string }
  | { type: "presence"; roomId: string; count: number }
  | { type: "event"; roomId: string; from: string; payload: unknown }
  | { type: "error"; message: string };

// 👇 Event maps (event name -> handler signature)
export type ServerToClientEvents = {
  msg: (m: ServerToClient) => void;
};

export type ClientToServerEvents = {
  msg: (m: ClientToServer) => void;
};
