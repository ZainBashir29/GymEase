import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Member from "../models/memberModel.js";
import Trainer from "../models/trainerModel.js";
import Session from "../models/gymPlans/sessionModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import MemberPlan from "../models/gymPlans/memberPlanModel.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllMembers = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;

  const filter = includeInactive == "true" ? {} : { isActive: true };

  const members = await Member.find(filter).select(
    "-password -refreshToken -isProfileCompleted -resetPasswordToken -resetPasswordExpiry",
  );

  res
    .status(200)
    .json(new ApiResponse(200, members, "Members fetched successfully"));
});

const getMemberById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid member id");
  }

  const member = await Member.findById(id).select(
    "-password -refreshToken -isProfileCompleted -resetPasswordToken -resetPasswordExpiry",
  );

  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, member, "Member fetched successfully"));
});

const deleteMember = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid member id");
  }

  const member = await Member.findById(id);

  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  if (!member.isActive) {
    throw new ApiError(400, "Member is already deactivated");
  }

  try {
    member.isActive = false;
    await member.save({ validateBeforeSave: false });

    await MembershipSubscription.findOneAndUpdate(
      {
        memberId: req.user?._id,
        status: "active",
      },
      {
        $set: {
          status: "expired",
        },
      },
      {
        returnDocument: "after",
      },
    );

    const cancelledMemberPlan = await MemberPlan.findOne({
      memberId: req.user?._id,
      status: "active",
    });

    if (cancelledMemberPlan) {
      cancelledMemberPlan.status = "cancelled";
      await cancelledMemberPlan.save({ validateBeforeSave: false });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await Session.deleteMany({
        memberPlanId: cancelledMemberPlan._id,
        date: {
          $gte: today,
        },
      });
    }
  } catch (error) {
    console.error(
      "Error occured in saving updated member to the database: ",
      error?.message,
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, member, "Member deactivated successfully"));
});

const getAllTrainers = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;

  const filter = includeInactive == "true" ? {} : { isActive: true };

  const trainers = await Trainer.find(filter).select(
    "-password -refreshToken -isProfileCompleted -resetPasswordToken -resetPasswordExpiry",
  );

  res
    .status(200)
    .json(new ApiResponse(200, trainers, "Trainers fetched successfully"));
});

const getTrainerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid trainer id");
  }

  const trainer = await Trainer.findById(id).select(
    "-password -refreshToken -isProfileCompleted -resetPasswordToken -resetPasswordExpiry",
  );

  if (!trainer) {
    throw new ApiError(404, "Trainer not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, trainer, "Trainer fetched successfully"));
});

const updateTrainer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid trainer id");
  }

  const allowedFields = [
    "fullName",
    "email",
    "profilePicture",
    "profilePictuePublicId",
    "expertise",
  ];

  const trainer = await Trainer.findById(id);

  if (!trainer) {
    throw new ApiError(404, "Trainer not found");
  }

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] != undefined) {
      updates[field] = req.body[field];
    }
  }

  const profilePictureLocalPath = req.file?.path;
  const previousPublicId = trainer.profilePicturePublicId;

  if (profilePictureLocalPath) {
    const cloudinary = await uploadOnCloudinary(localFilePath);

    if (!cloudinary) {
      throw new ApiError(500, "Could not upload profile picture to cloudinary");
    }

    updates.profilePicture = cloudinary?.url || "";
    updates.profilePicturePublicId = cloudinary?.public_id || "";
  }

  if (Object.keys(updates).length == 0) {
    throw new ApiError(400, "No valid update fields");
  }

  const updatedTrainer = await Trainer.findByIdAndUpdate(
    id,
    { $set: updates },
    { returnDocument: "after" },
  ).select(
    "-password -refreshToken -isProfileCompleted -resetPasswordToken -resetPasswordExpiry",
  );

  if (!updatedTrainer) {
    throw new ApiError(404, "Trainer not found");
  }

  if (profilePictureLocalPath && previousPublicId) {
    try {
      await deleteFromCloudinary(previousPublicId);
    } catch (error) {
      console.error(
        `Could not delete previous profile picture ${previousPublicId}`,
        error,
      );
    }
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedTrainer, "Trainer updated successfully"));
});

const deleteTrainer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid trainer id");
  }

  const trainer = await Trainer.findById(id);

  if (!trainer) {
    throw new ApiError(404, "Trainer not found");
  }

  if (!trainer.isActive) {
    throw new ApiError(400, "Trainer is already deactivated");
  }

  const upcomingSessionsCount = await Session.countDocuments({
    trainerId: id,
    status: "upcoming",
  });

  if (upcomingSessionsCount > 0) {
    throw new ApiError(
      400,
      `This trainer has ${upcomingSessionsCount} upcoming session/s.`,
    );
  }

  try {
    trainer.isActive = false;
    await trainer.save({ validateBeforeSave: false });
  } catch (error) {
    console.error(
      "Error occured in saving updated trainer in the database: ",
      error?.message,
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, trainer, "Trainer deactivated successfully"));
});

const getSystemOverview = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    totalActiveMembers,
    totalActiveTrainers,
    totalActiveMemberships,
    totalActiveGymPlans,
    todaySessionsCount,
  ] = await Promise.all([
    Member.countDocuments({ isActive: true }),
    Trainer.countDocuments({ isActive: true }),
    MembershipSubscription.countDocuments({ status: "active" }),
    MemberPlan.countDocuments({ status: "active" }),
    Session.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay } }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalActiveMembers,
        totalActiveTrainers,
        totalActiveMemberships,
        totalActiveGymPlans,
        todaySessionsCount,
      },
      "System overview fetched successfully",
    ),
  );
});

const getRevenueSummary = asyncHandler(async (req, res) => {
  const revenueByType = await Payment.aggregate([
    { $match: { status: "successful" } },
    {
      $group: {
        _id: "$type",
        totalRevenue: { $sum: "$amount" },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  const totalRevenue = revenueByType.reduce(
    (sum, revenueType) => sum + revenueType.totalRevenue,
    0,
  );

  const refundedResult = await Payment.aggregate([
    { $match: { status: "refunded" } },
    { $group: { _id: null, totalRefunded: { $sum: "$amount" } } },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalRevenue,
        revenueByType,
        totalRefunded: refundedResult[0]?.totalRefunded || 0,
      },
      "Revenue summary fetched successfully",
    ),
  );
});

const addGymPlan = asyncHandler(async (req, res) => {
  const { name, description, details, sessions, duration, trainerIds } =
    req.body;

  if (!name || !description || !details) {
    throw new ApiError(400, "name, description and details are required");
  }

  if (!duration || duration < 1) {
    throw new ApiError(400, "duration must be a positive number of days");
  }

  if (!Array.isArray(sessions) || sessions.length === 0) {
    throw new ApiError(
      400,
      "sessions must be a non-empty array of workout templates",
    );
  }

  for (const session of sessions) {
    if (
      !session.name ||
      !Array.isArray(session.exercises) ||
      session.exercises.length === 0
    ) {
      throw new ApiError(
        400,
        "Each session template needs a name and at least one exercise",
      );
    }
  }

  if (!Array.isArray(trainerIds) || trainerIds.length === 0) {
    throw new ApiError(400, "At least one trainerId is required");
  }

  if (trainerIds.some((id) => !mongoose.isValidObjectId(id))) {
    throw new ApiError(400, "One or more trainerIds are invalid");
  }

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

  const gymPlan = await GymPlan.create({
    name,
    type: "popular",
    description,
    details,
    sessions,
    duration,
    trainerIds,
  });

  res
    .status(201)
    .json(new ApiResponse(201, gymPlan, "Gym plan created successfully"));
});

const updateGymPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updateFields = [
    "name",
    "description",
    "details",
    "sessions",
    "duration",
    "trainerIds",
    "isActive",
  ];

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid gym plan id");
  }

  const gymPlan = await GymPlan.findById(id);

  if (!gymPlan) {
    throw new ApiError(404, "Gym plan not found");
  }
  if (gymPlan.type !== "popular") {
    throw new ApiError(400, "Custom plans cannot be edited directly");
  }

  const updates = {};

  for (const field of updateFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (updates.trainerIds) {
    if (
      updates.trainerIds.some(
        (trainerId) => !mongoose.isValidObjectId(trainerId),
      )
    ) {
      throw new ApiError(400, "One or more trainerIds are invalid");
    }

    const validTrainers = await Trainer.find({
      _id: { $in: updates.trainerIds },
      isActive: true,
    });

    if (validTrainers.length !== updates.trainerIds.length) {
      throw new ApiError(
        400,
        "One or more trainerIds do not match an active trainer",
      );
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided to update");
  }

  const updatedGymPlan = await GymPlan.findByIdAndUpdate(
    id,
    { $set: updates },
    { returnDocument: "after" },
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedGymPlan, "Gym plan updated successfully"),
    );
});

const deleteGymPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid gym plan id");
  }

  const gymPlan = await GymPlan.findById(id);

  if (!gymPlan) { 
    throw new ApiError(404, "Gym plan not found"); 
  }

  if (!gymPlan.isActive) {
    throw new ApiError(400, "Gym plan is already deactivated");
  }

  try {
    gymPlan.isActive = false;
    await gymPlan.save({ validateBeforeSave: false });
  } catch (error) {
    console.error(
      "Error occurred in saving updated gym plan to the database: ",
      error
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, gymPlan, "Gym plan deactivated successfully"));
});
