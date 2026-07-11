import Trainer from "../models/trainerModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/* Get logged in trainer profile */
const getTrainerProfile = asyncHandler(async (req, res) => {
    const trainer = await Trainer.findById(req.user._id);

    if (!trainer) {
        throw new ApiError(404, "Trainer not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            trainer,
            "Trainer profile fetched successfully"
        )
    );
});

/* Update trainer profile */
const updateTrainerProfile = asyncHandler(async (req, res) => {
    const { expertise } = req.body;

    const trainer = await Trainer.findById(req.user._id);

    if (!trainer) {
        throw new ApiError(404, "Trainer not found");
    }

    if (expertise) {
        trainer.expertise = expertise.trim();
    }

    await trainer.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            trainer,
            "Trainer profile updated successfully"
        )
    );
});

/* Get all trainers */
const getAllTrainers = asyncHandler(async (_, res) => {
    const trainers = await Trainer.find().select(
        "-password -refreshToken"
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            trainers,
            "All trainers fetched successfully"
        )
    );
});

/* Get trainer by id */
const getTrainerById = asyncHandler(async (req, res) => {
    const { trainerId } = req.params;

    const trainer = await Trainer.findById(
        trainerId
    ).select(
        "-password -refreshToken"
    );

    if (!trainer) {
        throw new ApiError(404, "Trainer not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            trainer,
            "Trainer fetched successfully"
        )
    );
});
/* Assign member to trainer */
const assignMemberToTrainer = asyncHandler(async (req, res) => {
    const { trainerId, memberId } = req.body;
    if (!trainerId || !memberId) {
        throw new ApiError(
            400,
            "Trainer id and member id are required"
        );
    }
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
        throw new ApiError(
            404,
            "Trainer not found"
        );
    }
    const member = await Member.findById(memberId);

    if (!member) {
        throw new ApiError(
            404,
            "Member not found"
        );
    }

    if (member.assignedTrainerId) {
        throw new ApiError(
            400,
            "Member is already assigned to a trainer"
        );
    }

    member.assignedTrainerId = trainer._id;
    member.trainerAssignmentStatus = "Assigned";

    await member.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            member,
            "Member assigned successfully"
        )
    );
});
/* Get assigned members */
const getAssignedMembers = asyncHandler(async (req, res) => {
    const members = await Member.find({
        assignedTrainerId: req.user._id,
    }).select(
        "-password -refreshToken"
    );
    return res.status(200).json(
        new ApiResponse(
            200,
            members,
            "Assigned members fetched successfully"
        )
    );
});
/* Remove assigned member */
const removeAssignedMember = asyncHandler(async (req, res) => {

    const { memberId } = req.body;

    if (!memberId) {
        throw new ApiError(
            400,
            "Member id is required"
        );
    }

    const member = await Member.findById(memberId);

    if (!member) {
        throw new ApiError(
            404,
            "Member not found"
        );
    }

    member.assignedTrainerId = null;
    member.trainerAssignmentStatus = "Pending";

    await member.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            member,
            "Member removed successfully"
        )
    );
});

export {
    getTrainerProfile,
    updateTrainerProfile,//admin
    getAllTrainers,//admin
    getTrainerById,//admin
    assignMemberToTrainer,//admin
    getAssignedMembers,
    removeAssignedMember,//admin
};
