import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import registerChatHandlers from "./chatSocketHandlers.js";

const onlineUsers = new Map();

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded?._id).select(
        "-password -refreshToken -isProfileCompleted -resetPasswordToken -resetPasswordExpiry",
      );

      if (!user) {
        return next(new Error("User not found"));
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    onlineUsers.set(userId, socket.id);
    console.log(
      `${socket.user?.fullName} connected with socket id: ${socket.id}`,
    );

    socket.broadcast.emit("userOnline", { userId });

    registerChatHandlers(io, socket, onlineUsers);

    socket.on("checkOnlineStatus", ({ userId: targetUserId }, callback) => {
      const isOnline = onlineUsers.has(targetUserId);
      callback?.({ userId: targetUserId, isOnline });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log(`${socket.user?.fullName} disconnected`);
    });

    socket.broadcast.emit("userOffline", { userId });
  });

  return io;
};

export { initializeSocket, onlineUsers };
