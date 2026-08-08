import mongoose from "mongoose";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import ApiError from "../utils/ApiError.js";

const createMessage = async ({
  conversationId,
  senderId,
  receiverId,
  messageText,
}) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isSenderParticipant = conversation.participants.some(
    (participant) => participant.toString() == senderId.toString(),
  );

  if (!isSenderParticipant) {
    throw new ApiError(403, "Access denied");
  }

  const isReceiverParticipant = conversation.participants.some(
    (participant) => participant.toString() == receiverId.toString(),
  );

  if (!isReceiverParticipant) {
    throw new ApiError(403, "Receiver does not belong to this conversation");
  }

  const message = await Message.create({
    conversationId,
    senderId,
    receiverId,
    messageText,
  });

  if (!message) {
    throw new ApiError(500, "Failed to send the message");
  }

  try {
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessage: message.messageText || "Message",
        lastMessageAt: message.createdAt,
      },
    });
  } catch (error) {
    console.error(
      `Failed to update conversation preview for ${conversationId}, `,
      error.message,
    );
  }

  return message;
};

const markMessagesRead = async ({ conversationId, readerId }) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (p) => p.toString() === readerId.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "Access denied");
  }

  const unreadMessages = await Message.find({
    conversationId,
    receiverId: readerId,
    isRead: false,
  }).select("senderId");

  if (unreadMessages.length == 0) {
    return { updatedCount: 0, senderIds: [] };
  }

  await Message.updateMany(
    { conversationId, receiverId: readerId, isRead: false },
    { $set: { isRead: true } },
  );

  const senderIds = [
    ...new Set(unreadMessages.map((message) => message.senderId.toString())),
  ];

  return { updatedCount: unreadMessages.length, senderIds };
};

export { createMessage, markMessagesRead };
