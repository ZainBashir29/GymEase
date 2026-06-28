import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import GymPlan from "../models/gymPlans/gymPlanModel.js";
import MemberPlan from "../models/gymPlans/memberPlanModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import Session from "../models/gymPlans/sessionModel.js";

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

    res.status(200).json(
      new ApiResponse(
        200,
        {
          memberPlan,
          sessions,
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
