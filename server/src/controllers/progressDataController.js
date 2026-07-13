import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Session from "../models/gymPlans/sessionModel.js";
import MemberPlan from "../models/gymPlans/memberPlanModel.js";
import ProgressData from "../models/progressDataModel.js";

const getMemberProgress = asyncHandler(async (req, res) => {
  const memberId = req.user?._id;

  const activePlan = await MemberPlan.findOne({
    memberId,
    status: "active",
  });

  if (!activePlan) {
    throw new ApiError(404, "No active gym plan found");
  }

  const progressData = await ProgressData.findOne({
    memberPlanId: activePlan._id,
  });

  if (!progressData) {
    throw new ApiError(404, "Progress data not found for this plan.");
  }

  const totalSessions = await Session.countDocuments({
    memberPlanId: activePlan._id,
  });

  const completedSessions = await Session.countDocuments({
    memberPlanId: activePlan._id,
    status: "completed",
  });

  const missedSessions = await Session.countDocuments({
    memberPlanId: activePlan._id,
    status: "missed",
  });

  const upcomingSessions = await Session.countDocuments({
    memberPlanId: activePlan._id,
    status: "upcoming",
  });

  const attendancePercentage =
    totalSessions == 0
      ? 0
      : Number(((completedSessions / totalSessions) * 100).toFixed(2));

  const resolvedSessions = completedSessions + missedSessions;

  const completionRate =
    resolvedSessions == 0
      ? 0
      : Number(((completedSessions / resolvedSessions) * 100).toFixed(2));

  const recentActivity = await Session.find({ memberPlanId: activePlan._id })
    .select("workoutName date status")
    .sort({ date: -1 })
    .limit(5);

  const lastCompletedSession = await Session.findOne({
    memberPlanId: activePlan._id,
    status: "completed",
  })
    .select("workoutName date")
    .sort({ date: -1 });

  const nextSession = await Session.findOne({
    memberPlanId: activePlan._id,
    status: "upcoming",
  })
    .select("workoutName date")
    .sort({ date: 1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        memberPlanId: activePlan._id,
        remainingDays: progressData.remainingDays,
        totalSessions,
        completedSessions,
        missedSessions,
        upcomingSessions,
        attendancePercentage,
        completionRate,
        recentActivity,
        lastCompletedSession,
        nextSession,
      },
      "Member progress fetched successfully",
    ),
  );
});

export { getMemberProgress };
