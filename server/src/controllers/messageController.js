import mongoose from "mongoose";

import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/* Send message */
const sendMessage = asyncHandler(async (req, res) => {

    const {
        conversationId,
        receiverId,
        messageText,
    } = req.body;

    if (
        !conversationId ||
        !receiverId ||
        !messageText
    ) {
        throw new ApiError(
            400,
            "Conversation ID, receiver ID and message are required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new ApiError(
            400,
            "Invalid conversation ID"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        throw new ApiError(
            400,
            "Invalid receiver ID"
        );
    }

    const conversation = await Conversation.findById(
        conversationId
    );

    if (!conversation) {
        throw new ApiError(
            404,
            "Conversation not found"
        );
    }

    const isSenderParticipant =
        conversation.participants.some(
            (participant) =>
                participant.toString() ===
                req.user._id.toString()
        );

    if (!isSenderParticipant) {
        throw new ApiError(
            403,
            "Access denied"
        );
    }

    const isReceiverParticipant =
        conversation.participants.some(
            (participant) =>
                participant.toString() ===
                receiverId
        );

    if (!isReceiverParticipant) {
        throw new ApiError(
            403,
            "Receiver does not belong to this conversation"
        );
    }

    const message = await Message.create({

        conversationId,

        senderId: req.user._id,

        receiverId,

        messageText,

    });

    await Conversation.findByIdAndUpdate(

        conversationId,

        {

            lastMessage: message.messageText,

            lastMessageAt: message.createdAt,

        }

    );

    return res.status(201).json(

        new ApiResponse(

            201,

            message,

            "Message sent successfully"

        )

    );

});

/* Get conversation messages */
const getConversationMessages = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new ApiError(
            400,
            "Invalid conversation ID"
        );
    }

    const conversation = await Conversation.findById(
        conversationId
    );

    if (!conversation) {
        throw new ApiError(
            404,
            "Conversation not found"
        );
    }

    const isParticipant =
        conversation.participants.some(
            (participant) =>
                participant.toString() ===
                req.user._id.toString()
        );

    if (!isParticipant) {
        throw new ApiError(
            403,
            "Access denied"
        );
    }

    const messages = await Message.find({
        conversationId,
    })
        .populate(
            "senderId",
            "fullName role profilePicture"
        )
        .populate(
            "receiverId",
            "fullName role profilePicture"
        )
        .sort({
            createdAt: 1,
        });

    return res.status(200).json(

        new ApiResponse(

            200,

            messages,

            "Messages fetched successfully"

        )

    );

});

/* Mark messages as read */
const markMessagesAsRead = asyncHandler(async (req, res) => {

    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new ApiError(
            400,
            "Invalid conversation ID"
        );
    }

    const conversation = await Conversation.findById(
        conversationId
    );

    if (!conversation) {
        throw new ApiError(
            404,
            "Conversation not found"
        );
    }

    const isParticipant =
        conversation.participants.some(
            (participant) =>
                participant.toString() ===
                req.user._id.toString()
        );

    if (!isParticipant) {
        throw new ApiError(
            403,
            "Access denied"
        );
    }

    await Message.updateMany(
        {
            conversationId,
            receiverId: req.user._id,
            isRead: false,
        },
        {
            $set: {
                isRead: true,
            },
        }
    );

    return res.status(200).json(

        new ApiResponse(

            200,

            {},

            "Messages marked as read"

        )

    );

});

export {

    sendMessage,

    getConversationMessages,

    markMessagesAsRead,

};