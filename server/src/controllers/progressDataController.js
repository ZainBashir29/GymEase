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

  if (activePlan) {
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

    res.status(200).json(
      new ApiResponse(
        200,
        {
          hasActivePlan: true,
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

    return;
  }

  const subscription = await MembershipSubscription.findOne({
    memberId,
    status: "active",
  }).populate("membershipPlanId", "name price duration");

  if (!subscription) {
    throw new ApiError(
      400,
      "You do not have an active membership subscription",
    );
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const visitsThisMonth = await Attendance.countDocuments({
    userId: memberId,
    role: "Member",
    status: "present",
    date: { $gte: startOfMonth },
  });

  const lastVisit = await Attendance.findOne({
    userId: memberId,
    role: "Member",
    status: "present",
  })
    .select("date")
    .sort({ date: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        hasActivePlan: false,
        message:
          "You don't have an active gym plan yet. Select or create one for detailed session tracking.",
        membership: {
          plan: subscription.membershipPlanId?.name,
          status: subscription.status,
          endDate: subscription.endDate,
        },
        visitsThisMonth,
        lastVisit: lastVisit?.date || null,
      },
      "Member progress fetched successfully",
    ),
  );
});

const getTrainerProgress = asyncHandler(async (req, res) => {
  const trainerId = req.user?._id;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const monthlySessions = await Session.find({
    trainerId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });

  const completedThisMonth = monthlySessions.filter(
    (session) => session.trainerCompletedAt !== null,
  ).length;

  const missedThisMonth = monthlySessions.filter(
    (session) => session.status === "missed",
  ).length;

  const upcomingThisMonth = monthlySessions.filter(
    (session) => session.status === "upcoming",
  ).length;

  const resolvedThisMonth = completedThisMonth + missedThisMonth;

  const completionRate =
    resolvedThisMonth === 0
      ? 0
      : Number(((completedThisMonth / resolvedThisMonth) * 100).toFixed(2));

  const uniqueMembersThisMonth = await Session.distinct("memberId", {
    trainerId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalSessionsThisMonth: monthlySessions.length,
        completedThisMonth,
        missedThisMonth,
        upcomingThisMonth,
        completionRate,
        uniqueMembersThisMonth: uniqueMembersThisMonth.length,
      },
      "Trainer progress fetched successfully",
    ),
  );
});

export { getMemberProgress, getTrainerProgress };
