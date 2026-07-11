import Session from "../models/sessionModel.js";
import Member from "../models/memberModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/* Create a new training session */
const createSession = asyncHandler(async (req, res) => {

    const {
        memberId,
        sessionType,
        sessionDate,
    } = req.body;

    if (
        !memberId ||
        !sessionType ||
        !sessionDate
    ) {
        throw new ApiError(
            400,
            "All fields are required"
        );
    }

    const member = await Member.findById(memberId);

    if (!member) {
        throw new ApiError(
            404,
            "Member not found"
        );
    }

    if (!member.assignedTrainerId) {
        throw new ApiError(
            400,
            "Member has no assigned trainer"
        );
    }

    const existingSession = await Session.findOne({
        trainerId: member.assignedTrainerId,
        memberId,
        sessionDate,
        sessionType,
    });

    if (existingSession) {
        throw new ApiError(
            400,
            "Session already exists"
        );
    }

    const session = await Session.create({
        trainerId: member.assignedTrainerId,
        memberId,
        sessionType,
        sessionDate,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            session,
            "Session created successfully"
        )
    );

});

/* Get trainer sessions */
const getTrainerSessions = asyncHandler(async (req, res) => {

    const sessions = await Session.find({
        trainerId: req.user._id,
    })
        .populate(
            "memberId",
            "fullName username"
        )
        .sort({
            sessionDate: -1,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            sessions,
            "Trainer sessions fetched successfully"
        )
    );

});

/* Update session status */
const updateSessionStatus = asyncHandler(async (req, res) => {

    const { sessionId } = req.params;

    const { status, remarks } = req.body;

    const session = await Session.findById(sessionId);

    if (!session) {
        throw new ApiError(
            404,
            "Session not found"
        );
    }

    if (
        session.trainerId.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "Access denied"
        );
    }

    session.status = status;

    session.remarks = remarks || "";

    await session.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            session,
            "Session updated successfully"
        )
    );

});

/* Get today's member session */
const getMemberTodaySession = asyncHandler(async (req, res) => {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );

    const session = await Session.findOne({

        memberId: req.user._id,

        sessionDate: {
            $gte: today,
            $lt: tomorrow,
        },

    }).populate(
        "trainerId",
        "fullName expertise"
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            session,
            "Today's session fetched successfully"
        )
    );

});

export {
    createSession,
    getTrainerSessions,
    updateSessionStatus,
    getMemberTodaySession,
};