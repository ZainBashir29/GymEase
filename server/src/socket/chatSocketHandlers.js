import { createMessage, markMessagesRead } from "../services/message.js";

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

      const messageDoc = await createMessage({
        conversationId,
        senderId: socket.user?._id,
        receiverId,
        messageText,
      });

      const message = messageDoc.toJSON ? messageDoc.toJSON : messageDoc;

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

  socket.on("markAsRead", async (payload, callback) => {
    try {
      const { conversationId } = payload;

      if (!conversationId) {
        return callback?.({
          success: false,
          message: "conversationId is required",
        });
      }

      const result = await markMessagesRead({
        conversationId,
        readerId: socket.user._id,
      });

      callback?.({ success: true, ...result });

      for (const senderId of result?.senderIds) {
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesRead", {
            conversationId,
            readBy: socket.user._id,
          });
        }
      }
    } catch (error) {
      callback?.({
        success: false,
        message: error?.message || "Failed to mark messages as read",
      });
    }
  });
};

export default registerChatHandlers;
