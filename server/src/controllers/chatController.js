import Conversation from "../models/conversationModel.js";
import User from "../models/userModel.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
/* Create new conversation */

const createConversation = asyncHandler(
    async (request, response) => {
        const {
            receiverId,
        } = request.body;

        const senderId =
            request.user._id;

        if (!receiverId) {
            throw new ApiError(
                400,
                "Receiver id is required"
            );
        }

        const receiver =
            await User.findById(
                receiverId
            );

        if (!receiver) {
            throw new ApiError(
                404,
                "Receiver not found"
            );
        }

        const existingConversation =
            await Conversation.findOne({
                participants: {
                    $all: [
                        senderId,
                        receiverId,
                    ],
                },
            });

        if (
            existingConversation
        ) {
            return response
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        existingConversation,
                        "Conversation already exists"
                    )
                );
        }

        const conversation =
            await Conversation.create({
                participants: [
                    senderId,
                    receiverId,
                ],
            });

        return response
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    conversation,
                    "Conversation created successfully"
                )
            );
    }
);
export {
    createConversation,
};