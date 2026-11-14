
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const connectVisitorSocket = (publicKey, visitorId) => {
  return io(SOCKET_URL, {
    auth: {
      role: "visitor",
      publicKey,
      visitorId,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
};

export const connectAgentSocket = () => {
  return io(SOCKET_URL, {
    auth: {
      role: "agent",
    },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
  });
};
