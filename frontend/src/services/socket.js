
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Visitor Socket
export const connectVisitorSocket = (
  publicKey,
  visitorId,
  currentPage
) => {
  return io(SOCKET_URL, {
    auth: {
      role: "visitor",
      publicKey,
      visitorId,
      currentPage,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
};

// Agent Socket
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
