import mongoose from "mongoose";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import createMessage from "../services/message.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, receiverId, messageText } = req.body;

  if (!conversationId || !receiverId || !messageText) {
    throw new ApiError(
      400,
      "Conversation id, receiver id and message are required",
    );
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(400, "Invalid conversation id");
  }

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new ApiError(400, "Invalid receiver id");
  }

  if (receiverId == req.user?._id.toString()) {
    throw new ApiError(400, "You cannot send a message to yourself");
  }

  const message = await createMessage({
    conversationId,
    senderId: req.user?._id,
    receiverId,
    messageText,
  });

  res
    .status(201)
    .json(new ApiResponse(201, message, "Message sent successfully"));
});

const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(400, "Invalid conversation id");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() == req.user?._id.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "Access denied");
  }

  const messages = await Message.find({
    conversationId,
  })
    .populate("senderId", "fullName role profilePicture")
    .populate("receiverId", "fullName role profilePicture")
    .sort({
      createdAt: 1,
    });

  res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages fetched successfully"));
});

const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(400, "Invalid conversation id");
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() === req.user?._id.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "Access denied");
  }

  await Message.updateMany(
    {
      conversationId,
      receiverId: req.user?._id,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    },
  );

  res.status(200).json(new ApiResponse(200, {}, "Messages marked as read"));
});

export { sendMessage, getConversationMessages, markMessagesAsRead };
