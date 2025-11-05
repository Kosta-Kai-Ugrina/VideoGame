import { useEffect, useMemo, useRef, useState } from "react";
import { createSocket, SIO } from "../utils/sockets";
import { ClientToServer, ServerToClient } from "../model/socketModel";

export function useSocket() {
  const socketRef = useRef<SIO | null>(null);
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  // lazy-create to avoid reconnect storms on hot reload
  const socket = useMemo(() => {
    if (!socketRef.current) socketRef.current = createSocket();
    return socketRef.current;
  }, []);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onMsg = (m: ServerToClient) => {
      if (m.type === "hello") setSocketId(m.id);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("msg", onMsg);

    socket.connect(); // begin auto-reconnecting lifecycle

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("msg", onMsg);
      socket.disconnect();
    };
  }, [socket]);

  const send = (m: ClientToServer) => socket.emit("msg", m);
  return { socket, connected, socketId, send };
}
