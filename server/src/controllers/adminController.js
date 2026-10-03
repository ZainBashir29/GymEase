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
import sendEmail from "../services/nodemailer.js";
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
        status: { $in: ["active", "paused"] },
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
              status: activeGymPlan.status,
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

const deactivateMember = asyncHandler(async (req, res) => {
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

  member.isActive = false;
  await member.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, member, "Member deactivated successfully"));
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

  try {
    await Promise.all([
      Member.findByIdAndDelete(id),
      MembershipSubscription.deleteMany({ memberId: id }),
      Order.deleteMany({ memberId: id }),
      MemberPlan.deleteMany({ memberId: id }),
      Session.deleteMany({ memberId: id })
    ]);
  } catch (error) {
    console.error("Error deleting member and associated records:", error);
    throw new ApiError(500, "Failed to permanently delete member");
  }

  res.status(200).json(new ApiResponse(200, {}, "Member deleted successfully"));
});

const reactivateMember = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid member id");
  }

  const member = await Member.findById(id);

  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  if (member.isActive) {
    throw new ApiError(400, "Member is already active");
  }

  member.isActive = true;
  await member.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, member, "Member reactivated successfully"));
});

const changeMemberEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid member id");
  }

  if (!email) {
    throw new ApiError(400, "New email is required");
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new ApiError(400, "Invalid email format");
  }

  const member = await Member.findById(id);
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  const emailTaken = await Member.findOne({
    email: normalizedEmail,
    _id: { $ne: id },
  });
  if (emailTaken) {
    throw new ApiError(409, "This email address is already in use");
  }

  const oldEmail = member.email;
  member.email = normalizedEmail;
  await member.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: normalizedEmail,
      subject: "Your GymEase email address has been updated",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f9fafb; padding: 32px; border-radius: 12px;">
          <h2 style="color: #1e293b; margin-top: 0;">Email Address Changed</h2>
          <p style="color: #475569;">Hello <strong>${member.fullName}</strong>,</p>
          <p style="color: #475569;">
            As per your request, your GymEase account email address has been successfully updated by our admin team.
          </p>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px;">Previous email</p>
            <p style="margin: 0; font-weight: 600; color: #1e293b;">${oldEmail}</p>
            <p style="margin: 16px 0 8px 0; color: #64748b; font-size: 13px;">New email</p>
            <p style="margin: 0; font-weight: 600; color: #2563eb;">${normalizedEmail}</p>
          </div>
          <p style="color: #475569; font-size: 14px;">
            If you did not request this change, please contact our support immediately by replying to this email.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">— The GymEase Team</p>
        </div>
      `,
      text: `Hello ${member.fullName},\n\nYour GymEase account email has been changed from ${oldEmail} to ${normalizedEmail} as per your request.\n\nIf you did not request this change, please contact support immediately.\n\n— The GymEase Team`,
    });
  } catch (emailErr) {
    console.error("Failed to send email change notification:", emailErr);
  }

  res
    .status(200)
    .json(new ApiResponse(200, member, "Member email updated successfully"));
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

const deactivateTrainer = asyncHandler(async (req, res) => {
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

  trainer.isActive = false;
  await trainer.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, trainer, "Trainer deactivated successfully"));
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

  try {
    await Promise.all([
      Trainer.findByIdAndDelete(id),
      GymPlan.updateMany({ trainerIds: id }, { $pull: { trainerIds: id } }),
      Session.deleteMany({ trainerId: id }),
    ]);
  } catch (error) {
    console.error("Error deleting trainer and associated records:", error);
    throw new ApiError(500, "Failed to permanently delete trainer");
  }

  res.status(200).json(new ApiResponse(200, {}, "Trainer deleted successfully"));
});

const reactivateTrainer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid trainer id");
  }

  const trainer = await Trainer.findById(id);

  if (!trainer) {
    throw new ApiError(404, "Trainer not found");
  }

  if (trainer.isActive) {
    throw new ApiError(400, "Trainer is already active");
  }

  trainer.isActive = true;
  await trainer.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, trainer, "Trainer reactivated successfully"));
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

  let resolvedTrainerIds = [];
  if (Array.isArray(trainerIds) && trainerIds.length > 0) {
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

    resolvedTrainerIds = trainerIds;
  }

  const gymPlan = await GymPlan.create({
    name,
    type: "popular",
    description,
    details,
    sessions,
    duration,
    trainerIds: resolvedTrainerIds,
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

const reactivateGymPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid gym plan id");
  }

  const gymPlan = await GymPlan.findById(id);

  if (!gymPlan) {
    throw new ApiError(404, "Gym plan not found");
  }

  if (gymPlan.type !== "popular") {
    throw new ApiError(400, "Custom plans cannot be reactivated directly");
  }

  if (gymPlan.isActive) {
    throw new ApiError(400, "Gym plan is already active");
  }

  gymPlan.isActive = true;
  await gymPlan.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(new ApiResponse(200, gymPlan, "Gym plan reactivated successfully"));
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

const reactivateMembershipPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "No or invalid membership plan id");
  }

  const membershipPlan = await MembershipPlan.findById(id);

  if (!membershipPlan) {
    throw new ApiError(404, "Membership plan not found");
  }

  if (membershipPlan.isActive) {
    throw new ApiError(400, "Membership plan is already active");
  }

  membershipPlan.isActive = true;
  await membershipPlan.save({ validateBeforeSave: false });

  res.status(200).json(
    new ApiResponse(
      200,
      membershipPlan,
      "Membership plan reactivated successfully",
    ),
  );
});

const addTrainer = asyncHandler(async (req, res) => {
  const { fullName, email, password, expertise } = req.body;

  if (!fullName || !email || !password || !expertise) {
    throw new ApiError(400, "All fields are required");
  }

  const existingTrainer = await Trainer.findOne({
    email
  });

  if (existingTrainer) {
    throw new ApiError(
      409,
      "Trainer with this email or username already exists",
    );
  }

  const trainer = await Trainer.create({
    fullName,
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
  deactivateMember,
  reactivateMember,
  changeMemberEmail,
  getAllTrainers,
  getTrainerById,
  addTrainer,
  updateTrainer,
  deleteTrainer,
  deactivateTrainer,
  reactivateTrainer,
  getTrainerPerformance,
  getSystemOverview,
  getRevenueSummary,
  addGymPlan,
  updateGymPlan,
  deleteGymPlan,
  reactivateGymPlan,
  addMembershipPlan,
  updateMembershipPlan,
  deleteMembershipPlan,
  reactivateMembershipPlan,
};
