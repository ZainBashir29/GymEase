import Attendance from "../models/attendanceModel.js";
import Session from "../models/sessionModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/* Mark attendance for a session */
const markAttendance = asyncHandler(async (req, res) => {

    const {
        sessionId,
        status,
        remarks,
    } = req.body;

    if (!sessionId || !status) {
        throw new ApiError(
            400,
            "Session ID and status are required"
        );
    }

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

    const existingAttendance = await Attendance.findOne({
        sessionId,
        memberId: session.memberId,
    });

    if (existingAttendance) {
        throw new ApiError(
            400,
            "Attendance already marked"
        );
    }

    const attendance = await Attendance.create({
        sessionId,
        trainerId: session.trainerId,
        memberId: session.memberId,
        status,
        remarks: remarks || "",
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            attendance,
            "Attendance marked successfully"
        )
    );

});

/* Get trainer attendance */
const getTrainerAttendance = asyncHandler(async (req, res) => {

    const attendance = await Attendance.find({
        trainerId: req.user._id,
    })
        .populate(
            "memberId",
            "fullName username"
        )
        .populate(
            "sessionId",
            "sessionType sessionDate"
        )
        .sort({
            createdAt: -1,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            attendance,
            "Trainer attendance fetched successfully"
        )
    );

});

/* Get member attendance */
const getMemberAttendance = asyncHandler(async (req, res) => {

    const attendance = await Attendance.find({
        memberId: req.user._id,
    })
        .populate(
            "trainerId",
            "fullName expertise"
        )
        .populate(
            "sessionId",
            "sessionType sessionDate"
        )
        .sort({
            createdAt: -1,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            attendance,
            "Member attendance fetched successfully"
        )
    );

});

export {
    markAttendance,
    getTrainerAttendance,
    getMemberAttendance,
};