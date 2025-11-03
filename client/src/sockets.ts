// socket.ts
import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "./types";

const URL = process.env.REACT_APP_SOCKET_URL ?? "http://localhost:3001";

export type SIO = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createSocket(): SIO {
  const socket: SIO = io(URL, {
    path: "/socket.io",
    transports: ["websocket"],
    autoConnect: false,
    withCredentials: false,
  });
  return socket;
}
