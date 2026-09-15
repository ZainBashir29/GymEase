import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import GymPlan from "../models/gymPlans/gymPlanModel.js";
import MemberPlan from "../models/gymPlans/memberPlanModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import Session from "../models/gymPlans/sessionModel.js";
import {
  validateAnswers,
  generateCustomPlan,
} from "../services/questionnaire.js";
import QuestionnaireResponse from "../models/gymPlans/questionnaireResponseModel.js";
import ProgressData from "../models/progressDataModel.js";
import mongoose from "mongoose";
import Trainer from "../models/trainerModel.js";
import Attendance from "../models/attendanceModel.js";

const findAvailableTrainer = async (allowedTrainers, targetDate, session) => {
  if (!allowedTrainers || allowedTrainers.length === 0) return null;

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  let bestTrainer = allowedTrainers[0];
  let minSessions = Infinity;

  for (const trainerId of allowedTrainers) {
    const sessionCount = await Session.countDocuments({
      trainerId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).session(session);

    if (sessionCount < 3) {
      return trainerId;
    }

    if (sessionCount < minSessions) {
      minSessions = sessionCount;
      bestTrainer = trainerId;
    }
  }

  return bestTrainer;
};

const getAllPopularPlans = asyncHandler(async (req, res) => {
  const popularPlans = await GymPlan.find({
    type: "popular",
  });

  if (!popularPlans) {
    throw new ApiError(500, "Could not fetch popular gym plans");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        popularPlans,
        "Popular gym plans fetched successfully",
      ),
    );
});

const getPlanById = asyncHandler(async (req, res) => {
  const { gymPlanId } = req.params;

  if (!gymPlanId || !mongoose.isValidObjectId(gymPlanId)) {
    throw new ApiError(400, "Gym plan id is required");
  }

  const gymPlan = await GymPlan.findById(gymPlanId);

  if (!gymPlan) {
    throw new ApiError(404, "Gym plan not fonund");
  }

  res
    .status(200)
    .json(new ApiResponse(200, gymPlan, "Gym plan found successfully"));
});

const activatePopularPlan = asyncHandler(async (req, res) => {
  const { gymPlanId } = req.params;

  const activeMember = await MembershipSubscription.findOne({
    memberId: req.user?._id,
    status: "active",
  }).populate("membershipPlanId");

  if (!activeMember) {
    throw new ApiError(
      400,
      "You have to be an active member to select a gym plan",
    );
  }

  if (!gymPlanId || !mongoose.isValidObjectId(gymPlanId)) {
    throw new ApiError(400, "Gym plan id is required");
  }

  const existingPlan = await MemberPlan.findOne({
    memberId: req.user?._id,
    status: "active",
  });

  if (existingPlan) {
    throw new ApiError(400, "You already have an active gym plan");
  }

  const gymPlan = await GymPlan.findById(gymPlanId);

  if (!gymPlan || gymPlan?.type != "popular") {
    throw new ApiError(404, "Gym plan not found");
  }

  if (!gymPlan.trainerIds || gymPlan.trainerIds.length == 0) {
    throw new ApiError(400, "This gym plan has no trainers assigned");
  }

  const maxTrainers = activeMember.membershipPlanId?.maxTrainers || 1;

  const validTrainers = await Trainer.find({
    _id: { $in: gymPlan.trainerIds },
    isActive: true,
  });

  if (!validTrainers || validTrainers.length === 0) {
    throw new ApiError(
      400,
      "No active trainers are currently assigned to this gym plan",
    );
  }

  const allowedTrainers = validTrainers
    .slice(0, maxTrainers)
    .map((trainer) => trainer._id);

  const startDate = new Date();
  const sessionDocuments = [];
  const workouts = gymPlan.sessions;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [memberPlan] = await MemberPlan.create(
      [
        {
          gymPlanId,
          memberId: req.user?._id,
          duration: gymPlan.duration,
          startDate,
          status: "active",
        },
      ],
      {
        session,
      },
    );

    const getValidDaysOfWeek = (frequency) => {
      if (frequency <= 2) return [1, 4];
      if (frequency === 3) return [1, 3, 5];
      if (frequency === 4) return [1, 2, 4, 5];
      if (frequency === 5) return [1, 2, 3, 4, 5];
      return [1, 2, 3, 4, 5, 6];
    };

    // const trainerId = await findAvailableTrainer(
    //   allowedTrainers,
    //   targetDate,
    //   session,
    // );
    // const workout = workouts[(day - 1) % workouts.length];

    const validDays = getValidDaysOfWeek(workouts.length);
    let workoutIndex = 0;
    let dayCounter = 1;

    for (let i = 0; i < gymPlan.duration; i++) {
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + i);

      if (validDays.includes(targetDate.getDay())) {
        const rotatedTrainers = [
          ...allowedTrainers.slice(workoutIndex % allowedTrainers.length),
          ...allowedTrainers.slice(0, workoutIndex % allowedTrainers.length),
        ];

        const trainerId = await findAvailableTrainer(
          rotatedTrainers,
          targetDate,
          session,
        );

        const workout = workouts[workoutIndex % workouts.length];

        if (!trainerId) {
          throw new ApiError(
            409,
            `No trainer is available on date ${targetDate.toDateString()}`,
          );
        }

        sessionDocuments.push({
          memberPlanId: memberPlan?._id,
          memberId: req.user?._id,
          trainerId,
          workoutName: workout.name,
          exercises: workout.exercises,
          day: dayCounter++,
          date: targetDate,
          status: "upcoming",
        });

        workoutIndex++;
      }
    }

    const sessions = await Session.insertMany(sessionDocuments, {
      session,
    });

    const firstSessionTrainerId = sessionDocuments[0]?.trainerId;

    const [progressData] = await ProgressData.create(
      [
        {
          memberPlanId: memberPlan._id,
          memberId: req.user?._id,
          trainerId: firstSessionTrainerId,
          remainingDays: gymPlan.duration,
          completedSessions: 0,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          memberPlan,
          sessions,
          progressData,
        },
        "Gym plan activated successfully",
      ),
    );
  } catch (transactionError) {
    await session.abortTransaction();

    if (transactionError instanceof ApiError) throw transactionError;

    throw new ApiError(
      500,
      transactionError?.message ||
        "Gym plan activation failed. Please try again",
    );
  } finally {
    session.endSession();
  }
});

const getActiveMemberPlan = asyncHandler(async (req, res) => {
  const memberPlan = await MemberPlan.findOne({
    memberId: req.user?._id,
    status: "active",
  });

  if (!memberPlan) {
    throw new ApiError(404, "No active member plan found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, memberPlan, "Member plan found successfully"));
});

const getMemberPlanHistory = asyncHandler(async (req, res) => {
  const planHistory = await MemberPlan.find({
    memberId: req.user?._id,
  }).sort({
    createdAt: -1,
  });

  if (!planHistory) {
    throw new ApiError(404, "Member plan history not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        planHistory,
        "Member plan history found successfully",
      ),
    );
});

const cancelMemberPlan = asyncHandler(async (req, res) => {
  const { memberPlanId } = req.params;

  const memberPlan = await MemberPlan.findById(memberPlanId);

  if (!memberPlan) {
    throw new ApiError(404, "Member plan not found");
  }

  if (memberPlan.memberId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this plan.");
  }

  if (memberPlan.status !== "active") {
    throw new ApiError(
      400,
      `Plan is already ${memberPlan.status}. Only active plans can be cancelled.`,
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    memberPlan.status = "cancelled";
    await memberPlan.save({ validateBeforeSave: false, session });

    const deletedFutureSessions = await Session.deleteMany(
      {
        memberPlanId: memberPlan._id,
        memberId: req.user._id,
        date: { $gte: today },
      },
      { session },
    );

    await session.commitTransaction();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          cancelledPlan: memberPlan,
          sessionsDeleted: deletedFutureSessions.deletedCount,
        },
        "Member's gym plan cancelled successfully",
      ),
    );
  } catch (transactionError) {
    await session.abortTransaction();
    throw new ApiError(500, "Failed to cancel member's gym plan");
  } finally {
    session.endSession();
  }
});

const activateCustomPlan = asyncHandler(async (req, res) => {
  const { answers } = req.body;

  const validation = validateAnswers(answers);

  const existingActivePlan = await MemberPlan.findOne({
    memberId: req.user?._id,
    status: "active",
  });

  if (existingActivePlan) {
    throw new ApiError(400, "You already have an active gym plan");
  }

  const subscription = await MembershipSubscription.findOne({
    memberId: req.user?._id,
    status: "active",
  }).populate("membershipPlanId");

  if (!subscription) {
    throw new ApiError(
      400,
      "You need an active membership to create a gym plan.",
    );
  }

  if (subscription.membershipPlanId?.name === "Basic") {
    throw new ApiError(
      403,
      "Basic plan members cannot request custom gym plans. Please upgrade to Standard or Premium.",
    );
  }

  const maxTrainers = subscription.membershipPlanId?.maxTrainers || 1;

  const trainers = await Trainer.find({ isActive: true });

  if (!trainers || trainers.length === 0) {
    throw new ApiError(
      400,
      "No active trainers are available in the system right now",
    );
  }

  const allowedTrainers = trainers
    .slice(0, maxTrainers)
    .map((trainer) => trainer._id);

  const customGymPlan = generateCustomPlan(answers);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [questionnaireResponse] = await QuestionnaireResponse.create(
      [{ memberId: req.user?._id, answers }],
      { session },
    );

    const [gymPlan] = await GymPlan.create(
      [
        {
          name: customGymPlan.name,
          type: customGymPlan.type,
          description: customGymPlan.description,
          details: customGymPlan.details,
          sessions: customGymPlan.sessions,
          duration: customGymPlan.duration,
          trainerIds: allowedTrainers,
        },
      ],
      { session },
    );

    const startDate = new Date();
    const [memberPlan] = await MemberPlan.create(
      [
        {
          gymPlanId: gymPlan._id,
          memberId: req.user?._id,
          duration: customGymPlan.duration,
          startDate,
          status: "active",
        },
      ],
      { session },
    );

    const sessionDocuments = [];

    const getValidDaysOfWeek = (frequency) => {
      if (frequency <= 2) return [1, 4];
      if (frequency === 3) return [1, 3, 5];
      if (frequency === 4) return [1, 2, 4, 5];
      if (frequency === 5) return [1, 2, 3, 4, 5];
      return [1, 2, 3, 4, 5, 6];
    };

    const weeks = Math.max(1, Math.round(customGymPlan.duration / 7));
    const sessionsPerWeek = Math.max(
      1,
      Math.round(customGymPlan.sessions.length / weeks),
    );
    const validDays = getValidDaysOfWeek(sessionsPerWeek);

    let sessionIndex = 0;
    let dayCounter = 1;
    let offset = 0;

    while (sessionIndex < customGymPlan.sessions.length && offset < 60) {
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + offset);

      if (validDays.includes(targetDate.getDay())) {
        const rotatedTrainers = [
          ...allowedTrainers.slice(sessionIndex % allowedTrainers.length),
          ...allowedTrainers.slice(0, sessionIndex % allowedTrainers.length),
        ];

        const trainerId = await findAvailableTrainer(
          rotatedTrainers,
          targetDate,
          session,
        );

        if (!trainerId)
          throw new Error(
            `No trainer is available on date ${targetDate.toDateString()}`,
          );

        const workout = customGymPlan.sessions[sessionIndex];

        sessionDocuments.push({
          memberPlanId: memberPlan._id,
          memberId: req.user?._id,
          trainerId,
          day: dayCounter++,
          date: targetDate,
          workoutName: workout.name,
          exercises: workout.exercises,
          status: "upcoming",
        });

        sessionIndex++;
      }
      offset++;
    }

    const sessions = await Session.insertMany(sessionDocuments, {
      session,
    });

    const firstSessionTrainerId = sessionDocuments[0]?.trainerId;

    const [progressData] = await ProgressData.create(
      [
        {
          memberPlanId: memberPlan._id,
          memberId: req.user?._id,
          trainerId: firstSessionTrainerId,
          remainingDays: gymPlan.duration,
          completedSessions: 0,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    res.status(201).json(
      new ApiResponse(
        201,
        {
          questionnaireResponse,
          gymPlan,
          memberPlan,
          sessions,
          progressData,
        },
        "Custom gym plan created successfully",
      ),
    );
  } catch (transactionError) {
    await session.abortTransaction();

    if (transactionError instanceof ApiError) throw transactionError;

    throw new ApiError(
      500,
      transactionError?.message ||
        "Custom gym plan creation and activation failed. Please try again",
    );
  } finally {
    session.endSession();
  }
});

const getMemberQuestionnaire = asyncHandler(async (req, res) => {
  const questionnaireResponse = await QuestionnaireResponse.findOne({
    memberId: req.user?._id,
  }).sort({
    createdAt: -1,
  });

  if (!questionnaireResponse) {
    throw new ApiError(404, "No questionnaire found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        questionnaireResponse,
        "Questionnaire found successfully",
      ),
    );
});

const getMemberTodaySession = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const session = await Session.findOne({
    memberId: req.user?._id,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).populate("trainerId", "fullName profilePicture");

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, session, "Session found successfully"));
});

const getTrainerTodaySessions = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const trainerTodaySessions = await Session.find({
    trainerId: req.user?._id,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  }).populate("memberId", "fullName profilePicture");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        trainerTodaySessions,
        "Trainer's today sessions found successfully",
      ),
    );
});

const getAllSessionsForPlan = asyncHandler(async (req, res) => {
  const { memberPlanId } = req.params;

  if (!memberPlanId || !mongoose.isValidObjectId(memberPlanId)) {
    throw new ApiError(400, "No or invalid member plan id");
  }

  const sessions = await Session.find({
    memberPlanId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, sessions, "Sessions found successfully"));
});

const getTrainerAllSessions = asyncHandler(async (req, res) => {
  const trainerSessions = await Session.find({
    trainerId: req.user?._id,
  }).populate("memberId", "fullName profilePicture");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        trainerSessions,
        "Trainer sessions found successfully",
      ),
    );
});

const getMemberAllSessions = asyncHandler(async (req, res) => {
  const memberSessions = await Session.find({
    memberId: req.user?._id,
  })
    .populate("trainerId", "fullName profilePicture")
    .populate({
      path: "memberPlanId",
      populate: {
        path: "gymPlanId",
        select: "name",
      },
    });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        memberSessions,
        "Member sessions fetched successfully",
      ),
    );
});

const markSessionComplete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid session id");
  }

  const session = await Session.findById(id);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.memberId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this session");
  }

  if (session.status != "upcoming") {
    throw new ApiError(400, `Session is already marked as ${session.status}`);
  }

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  if (new Date(session.date) > endOfToday) {
    throw new ApiError(
      400,
      "You cannot mark a future session as completed before its scheduled date",
    );
  }

  try {
    session.status = "completed";
    session.memberCompletedAt = new Date();
    await session.save({ validateBeforeSave: false });

    const nextUpcomingSession = await Session.findOne({
      memberPlanId: session.memberPlanId,
      status: "upcoming",
    }).sort({ date: 1 });

    if (!nextUpcomingSession) {
      await MemberPlan.findByIdAndUpdate(
        session.memberPlanId,
        { $set: { status: "completed" } },
        { returnDocument: "after" },
      );
    }

    const updatedProgressData = await ProgressData.findOneAndUpdate(
      { memberPlanId: session.memberPlanId },
      {
        $inc: { completedSessions: 1, remainingDays: -1 },
        $set: {
          date: new Date(),
          ...(nextUpcomingSession && {
            trainerId: nextUpcomingSession.trainerId,
          }),
        },
      },
      { returnDocument: "after" },
    );

    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const existingAttendance = await Attendance.findOne({
        userId: req.user._id,
        date: { $gte: startOfDay, $lte: endOfDay },
      });

      if (!existingAttendance) {
        await Attendance.create({
          role: req.user.role || "Member",
          userId: req.user._id,
          status: "present",
          date: new Date(),
        });
      }
    } catch (attendanceErr) {
      console.warn(
        "Auto-attendance failed during session completion:",
        attendanceErr?.message,
      );
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          completedSession: session,
          progressData: updatedProgressData,
        },
        "Session marked as completed successfully",
      ),
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      error?.message || "Could not update session status to completed",
    );
  }
});

// const markSessionMissed = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   if (!id || !mongoose.isValidObjectId(id)) {
//     throw new ApiError(400, "No or invalid session id");
//   }

//   const completedSession = await Sessions.findByIdAndUpdate(
//     id,
//     {
//       $set: {
//         status: "missed",
//       },
//     },
//     {
//       returnDocument: "after",
//     },
//   );

//   if (!completedSession) {
//     throw new ApiError(500, "Could not mark session as missed");
//   }

//   res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         completedSession,
//         "Session marked as missed successfully",
//       ),
//     );
// });

const markSessionConductedByTrainer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid session id");
  }

  const session = await Session.findById(id);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.trainerId.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this session");
  }

  if (session.trainerCompletedAt) {
    throw new ApiError(400, "You've already marked this session as conducted");
  }

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  if (new Date(session.date) > endOfToday) {
    throw new ApiError(
      400,
      "You cannot mark a future session as conducted before its scheduled date",
    );
  }

  session.trainerCompletedAt = new Date();
  await session.save();

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!existingAttendance) {
      await Attendance.create({
        role: "Trainer",
        userId: req.user._id,
        status: "present",
        date: new Date(),
      });
    }
  } catch (attendanceErr) {
    console.warn(
      "Auto-attendance failed during trainer session completion:",
      attendanceErr?.message,
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, session, "Session marked as conducted successfully"),
    );
});

export {
  getAllPopularPlans,
  getPlanById,
  activatePopularPlan,
  getActiveMemberPlan,
  getMemberPlanHistory,
  cancelMemberPlan,
  activateCustomPlan,
  getMemberQuestionnaire,
  getMemberTodaySession,
  getTrainerTodaySessions,
  getAllSessionsForPlan,
  getTrainerAllSessions,
  getMemberAllSessions,
  markSessionComplete,
  markSessionConductedByTrainer,
};
