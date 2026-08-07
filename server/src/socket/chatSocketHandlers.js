import { createMessage } from "../services/message.js";

const registerChatHandlers = (io, socket, onlineUsers) => {
  socket.on("sendMessage", async (payload, callback) => {
    try {
      const { conversationId, receiverId, messageText } = payload;

      if (!conversationId || !receiverId || !messageText) {
        return callback?.({
          success: false,
          message: "Missing required fields",
        });
      }

      if (receiverId == socket.user?._id.toString()) {
        return callback?.({
          success: false,
          message: "You cannot message yourself",
        });
      }

      const message = await createMessage({
        conversationId,
        senderId: socket.user?._id,
        receiverId,
        messageText,
      });

      callback?.({ success: true, message });

      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }
    } catch (error) {
      callback?.({
        success: false,
        message: error?.message || "Failed to send message",
      });
    }
  });
};

export default registerChatHandlers;
