import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import Member from "../models/memberModel.js";
import Trainer from "../models/trainerModel.js";
import Session from "../models/gymPlans/sessionModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import MemberPlan from "../models/gymPlans/memberPlanModel.js";
import MembershipPlan from "../models/membershipPlanModel.js";
import GymPlan from "../models/gymPlans/gymPlanModel.js";
import Payment from "../models/paymentModel.js";
import Order from "../models/orderModel.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.js";

const getAllMembers = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;

  const filter = includeInactive == "true" ? {} : { isActive: true };

  const members = await Member.find(filter)
    .select(
      "-password -refreshToken -isProfileCompleted -resetPasswordToken -resetPasswordExpiry",
    )
    .lean();

  const membersWithDetails = await Promise.all(
    members.map(async (member) => {
      const activeMembership = await MembershipSubscription.findOne({
        memberId: member._id,
        status: "active",
      })
        .populate("membershipPlanId", "name")
        .lean();

      const activeGymPlan = await MemberPlan.findOne({
        memberId: member._id,
        status: "active",
      })
        .populate("gymPlanId", "name")
        .lean();

      return {
        ...member,
        membership: activeMembership
          ? {
              planName:
                activeMembership.membershipPlanId?.name || "Unknown Plan",
              endDate: activeMembership.endDate,
            }
          : null,
        gymPlan: activeGymPlan
          ? {
              planName: activeGymPlan.gymPlanId?.name || "Unknown Plan",
            }
          : null,
      };
    }),
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, membersWithDetails, "Members fetched successfully"),
    );
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
        memberId: id,
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
      memberId: id,
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

  const allowedFields = ["fullName", "email", "expertise"];

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
    const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);

    if (!profilePicture) {
      throw new ApiError(500, "Could not upload profile picture to cloudinary");
    }

    updates.profilePicture = profilePicture?.url || "";
    updates.profilePicturePublicId = profilePicture?.public_id || "";
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

const getTrainerPerformance = asyncHandler(async (req, res) => {
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

  const trainerStats = await Session.aggregate([
    {
      $match: {
        trainerId: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const statusCounts = {
    completed: 0,
    missed: 0,
    upcoming: 0,
  };

  trainerStats.forEach((stat) => {
    statusCounts[stat._id] = stat.count;
  });

  const resolvedSessions = statusCounts.completed + statusCounts.missed;

  const completionRate =
    resolvedSessions == 0
      ? null
      : Number(((statusCounts.completed / resolvedSessions) * 100).toFixed(1));

  const uniqueMemberIds = await Session.distinct("memberId", {
    trainerId: id,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        trainer,
        sessionStats: statusCounts,
        completionRate,
        totalMembersAssigned: uniqueMemberIds.length,
      },
      "Trainer performance fetched successfully",
    ),
  );
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
    recentOrders,
    recentMembers,
    todaySessions,
  ] = await Promise.all([
    Member.countDocuments({ isActive: true }),
    Trainer.countDocuments({ isActive: true }),
    MembershipSubscription.countDocuments({ status: "active" }),
    MemberPlan.countDocuments({ status: "active" }),
    Session.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay } }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("memberId", "fullName email profilePicture"),
    Member.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName email profilePicture createdAt"),
    Session.find({ date: { $gte: startOfDay, $lte: endOfDay } })
      .populate("memberId", "fullName profilePicture")
      .populate("trainerId", "fullName")
      .limit(10)
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
        recentOrders,
        recentMembers,
        todaySessions,
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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const recentPayments = await Payment.find({
    status: "successful",
    createdAt: { $gte: thirtyDaysAgo },
  });

  const thirtyDayMap = {};
  recentPayments.forEach((p) => {
    const d = new Date(p.createdAt);
    const dateStr = d.toISOString().split("T")[0];
    thirtyDayMap[dateStr] = (thirtyDayMap[dateStr] || 0) + p.amount;
  });

  const thirtyDayRevenue = Object.keys(thirtyDayMap)
    .map((k) => ({ _id: k, revenue: thirtyDayMap[k] }))
    .sort((a, b) => a._id.localeCompare(b._id));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalRevenue,
        revenueByType,
        totalRefunded: refundedResult[0]?.totalRefunded || 0,
        thirtyDayRevenue,
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
      error,
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, gymPlan, "Gym plan deactivated successfully"));
});

const updateMembershipPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid membership plan id");
  }

  const updateFields = [
    "name",
    "price",
    "duration",
    "details",
    "maxTrainers",
    "isActive",
  ];

  const updates = {};

  for (const field of updateFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided to update");
  }

  if (updates.price !== undefined && updates.price <= 0) {
    throw new ApiError(400, "Price must be greater than 0");
  }

  if (updates.maxTrainers !== undefined && updates.maxTrainers < 1) {
    throw new ApiError(400, "maxTrainers must be at least 1");
  }

  const updatedPlan = await MembershipPlan.findByIdAndUpdate(
    id,
    { $set: updates },
    { returnDocument: "after" },
  );

  if (!updatedPlan) {
    throw new ApiError(404, "Membership plan not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlan, "Membership plan updated successfully"),
    );
});

const deleteMembershipPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid membership plan id");
  }

  const membershipPlan = await MembershipPlan.findById(id);

  if (!membershipPlan) {
    throw new ApiError(404, "Membership plan not found");
  }

  if (!membershipPlan.isActive) {
    throw new ApiError(400, "Membership plan is already deactivated");
  }

  try {
    membershipPlan.isActive = false;
    await membershipPlan.save({ validateBeforeSave: false });
  } catch (error) {
    console.error(
      "Error occurred in saving updated membership plan to the database: ",
      error,
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        membershipPlan,
        "Membership plan deactivated successfully",
      ),
    );
});

const addTrainer = asyncHandler(async (req, res) => {
  const { fullName, username, email, password, expertise } = req.body;

  if (!fullName || !username || !email || !password || !expertise) {
    throw new ApiError(400, "All fields are required");
  }

  const existingTrainer = await Trainer.findOne({
    $or: [{ username }, { email }],
  });

  if (existingTrainer) {
    throw new ApiError(
      409,
      "Trainer with this email or username already exists",
    );
  }

  const trainer = await Trainer.create({
    fullName,
    username,
    email,
    password,
    expertise,
    isActive: true,
  });

  const createdTrainer = await Trainer.findById(trainer._id).select(
    "-password -refreshToken -isProfileCompleted -resetPasswordToken -resetPasswordExpiry",
  );

  res
    .status(201)
    .json(new ApiResponse(201, createdTrainer, "Trainer added successfully"));
});

const addMembershipPlan = asyncHandler(async (req, res) => {
  const { name, price, details, duration, maxTrainers } = req.body;

  if (!name || !price || !details || !duration) {
    throw new ApiError(400, "Name, price, details and duration are required");
  }

  if (price <= 0) {
    throw new ApiError(400, "Price must be greater than 0");
  }

  const membershipPlan = await MembershipPlan.create({
    name,
    price,
    details,
    duration,
    maxTrainers: maxTrainers || 1,
    isActive: true,
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        membershipPlan,
        "Membership plan added successfully",
      ),
    );
});

export {
  getAllMembers,
  getMemberById,
  deleteMember,
  getAllTrainers,
  getTrainerById,
  addTrainer,
  updateTrainer,
  deleteTrainer,
  getTrainerPerformance,
  getSystemOverview,
  getRevenueSummary,
  addGymPlan,
  updateGymPlan,
  deleteGymPlan,
  addMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
};
