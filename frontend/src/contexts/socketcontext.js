// src/contexts/SocketContext.js
import React, { createContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";

export const SocketContext = createContext();

const SOCKET_URL = "http://localhost:8080"; // Make sure this matches your backend URL

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    socket.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    // Log connection
    socket.current.on("connect", () => {
      console.log(`Connected to Socket.IO server: ${socket.current.id}`);
    });

    // Cleanup on component unmount
    return () => {
      socket.current.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
