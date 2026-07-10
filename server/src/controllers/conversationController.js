import Conversation from "../models/conversationModel.js";
import User from "../models/userModel.js";
import Member from "../models/memberModel.js";
import Trainer from "../models/trainerModel.js";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/* Create conversation */
const createConversation = asyncHandler(async (req, res) => {

    const { receiverId } = req.body;

    if (!receiverId) {
        throw new ApiError(
            400,
            "Receiver ID is required"
        );
    }

    if (receiverId === req.user._id.toString()) {
        throw new ApiError(
            400,
            "You cannot create conversation with yourself"
        );
    }
    
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new ApiError(
        400,
        "Invalid receiver ID"
    );
}

    const receiver = await User.findById(receiverId);

    if (!receiver) {
        throw new ApiError(
            404,
            "Receiver not found"
        );
    }

    const senderRole = req.user.role;
    const receiverRole = receiver.role;

    /* Member Rules */
    if (senderRole === "Member") {

        if (receiverRole === "Trainer") {

            const member = await Member.findById(req.user._id);

            if (
                !member ||
                !member.assignedTrainerId ||
                member.assignedTrainerId.toString() !== receiverId
            ) {
                throw new ApiError(
                    403,
                    "You can chat only with your assigned trainer"
                );
            }

        } else if (receiverRole !== "Admin") {

            throw new ApiError(
                403,
                "Members can chat only with Admin or assigned Trainer"
            );
        }
    }

    /* Trainer Rules */
    if (senderRole === "Trainer") {

        if (receiverRole === "Member") {

            const trainer = await Trainer.findById(req.user._id);

            const isAssigned = trainer.assignedMembers.some(
                (memberId) =>
                    memberId.toString() === receiverId
            );

            if (!isAssigned) {
                throw new ApiError(
                    403,
                    "You can chat only with assigned members"
                );
            }

        } else if (receiverRole !== "Admin") {

            throw new ApiError(
                403,
                "Trainers can chat only with Admin or assigned Members"
            );
        }
    }

    /* Admin can chat with everyone */

    let conversation = await Conversation.findOne({
        participants: {
            $all: [
                req.user._id,
                receiverId,
            ],
        },
    });

    if (conversation) {
        return res.status(200).json(
            new ApiResponse(
                200,
                conversation,
                "Conversation already exists"
            )
        );
    }

    conversation = await Conversation.create({
        participants: [
            req.user._id,
            receiverId,
        ],
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            conversation,
            "Conversation created successfully"
        )
    );

});

/* Get my conversations */
const getMyConversations = asyncHandler(async (req, res) => {

    const conversations = await Conversation.find({
        participants: req.user._id,
    })
        .populate(
            "participants",
            "fullName email role profilePicture"
        )
        .sort({
            updatedAt: -1,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            conversations,
            "Conversations fetched successfully"
        )
    );

});

export {
    createConversation,
    getMyConversations,
};