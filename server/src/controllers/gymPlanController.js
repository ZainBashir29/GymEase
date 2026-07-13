import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import GymPlan from "../models/gymPlans/gymPlanModel.js";
import MemberPlan from "../models/gymPlans/memberPlanModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import Session from "../models/gymPlans/sessionModel.js";
import { generateCustomPlan } from "../utils/questionnaire.js";
import QuestionnaireResponse from "../models/gymPlans/questionnaireResponseModel.js";

const findAvailableTrainer = async (allowedTrainers, targetDate, session) => {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

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
  }

  return null;
};

const getAllPopularPlans = asyncHandler(async (req, res) => {
  const popularPlans = await GymPlan.find({});

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

  const maxTrainers = activeMember.membershipPlanId?.maxTrainers;

  const allowedTrainers = gymPlan.trainerIds.slice(0, maxTrainers);

  const validTrainers = await Trainer.find({
    _id: { $in: trainerIds },
    isActive: true,
  });

  if (validTrainers.length !== trainerIds.length) {
    throw new ApiError(
      400,
      "One or more trainerIds do not match an active trainer",
    );
  }

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

    for (let day = 1; day <= gymPlan.duration; day++) {
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + (day - 1));

      const trainerId = await findAvailableTrainer(
        allowedTrainers,
        targetDate,
        session,
      );
      const workout = workouts[(day - 1) % workouts.length];

      if (!trainerId) {
        throw new ApiError(
          409,
          `No trainer is available on day ${day} ${targetDate.toDateString()}`,
        );
      }

      sessionDocuments.push({
        memberPlanId: memberPlan?._id,
        memberId: req.user?._id,
        trainerId,
        workoutName: workout.name,
        exercises: workout.exercises,
        day,
        date: targetDate,
        status: "upcoming",
      });
    }

    const sessions = await Session.insertMany(sessionDocuments, {
      session,
    });

    await session.commitTransaction();

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
    await memberPlan.save({ validateBeforeSave: false }, { session });

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
  }).populate("membershipId");

  if (!subscription) {
    throw new ApiError(
      400,
      "You need an active membership to create a gym plan.",
    );
  }

  const maxTrainers = subscription.membershipId.maxTrainers;

  const trainers = await Trainer.find({}).select("_id");

  if (!trainers || trainers.length === 0) {
    throw new ApiError(
      400,
      "No trainers are available in the system right now",
    );
  }

  const allTrainerIds = trainers.map((trainer) => t._id);

  const allowedTrainers = allTrainerIds.slice(0, maxTrainers);

  const validTrainers = await Trainer.find({
    _id: { $in: allowedTrainers },
    isActive: true,
  });

  if (validTrainers.length !== allowedTrainers.length) {
    throw new ApiError(
      400,
      "One or more trainerIds do not match an active trainer",
    );
  }

  const customGymPlan = generateCustomPlan(answers);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [questionnaireResponse] = await QuestionnaireResponses.create(
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

    for (let day = 1; day <= customGymPlan.sessions.length; day++) {
      const targetDate = new Date(startDate);
      targetDate.setDate(startDate.getDate() + (day - 1));

      const trainerId = await findAvailableTrainer(allowedTrainers, targetDate);

      if (!trainerId) {
        throw new Error(
          `No trainer is available on day ${day}, date = ${targetDate.toDateString()}`,
        );
      }

      const workout = customGymPlan.sessions[day - 1];

      sessionDocuments.push({
        memberPlanId: memberPlan._id,
        memberId: req.user?._id,
        trainerId,
        day,
        date: targetDate,
        workoutName: workout.name,
        exercises: workout.exercises,
        status: "upcoming",
      });
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
  });

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
  });

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
  });

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

  try {
    session.status = "completed";
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
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "Could not update session status to completed",
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          completedSession: session,
          progressData: 
        },
        "Session marked as completed successfully",
      ),
    );
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
  markSessionComplete,
};
