import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import Session from "../models/sessionModel.js";
import Member from "../models/memberModel.js";

/* Get member progress */
const getMemberProgress = asyncHandler(async (req, res) => {

    const member = await Member.findById(req.user._id)
        .populate(
            "assignedTrainerId",
            "fullName expertise"
        );

    if (!member) {
        throw new ApiError(
            404,
            "Member not found"
        );
    }

    const totalSessions = await Session.countDocuments({
        memberId: req.user._id,
    });

    const completedSessions = await Session.countDocuments({
        memberId: req.user._id,
        status: "Completed",
    });

    const missedSessions = await Session.countDocuments({
        memberId: req.user._id,
        status: "Missed",
    });

    const remainingSessions = await Session.countDocuments({
        memberId: req.user._id,
        status: "Pending",
    });

    const attendancePercentage =
        totalSessions === 0 ? 0 : Number (
                  (
                      (completedSessions /
                          totalSessions) *
                      100
                  ).toFixed(2)
              );

    const completionRate = completedSessions + missedSessions === 0 ? 0 : Number(
                  (
                      (completedSessions /
                          (completedSessions +
                              missedSessions)) *
                      100
                  ).toFixed(2)
              );

    const recentActivity = await Session.find({ memberId: req.user._id })
        .select(
            "sessionType sessionDate status remarks"
        )
        .sort({
            sessionDate: -1,
        })
        .limit(5);

    const lastCompletedSession = await Session.findOne({
        memberId: req.user._id,
        status: "Completed",
    })
        .select("sessionType sessionDate remarks")
        .sort({
            sessionDate: -1,
        });

    const nextSession = await Session.findOne({
        memberId: req.user._id,
        status: "Pending",
    })
        .select("sessionType sessionDate")
        .sort({
            sessionDate: 1,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                assignedTrainer:
                    member.assignedTrainerId,

                totalSessions,

                completedSessions,

                missedSessions,

                remainingSessions,

                attendancePercentage,

                completionRate,

                recentActivity,

                lastCompletedSession,

                nextSession,
            },
            "Member progress fetched successfully"
        )
    );
});

export {
    getMemberProgress,
};