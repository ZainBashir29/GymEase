import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Member from "../models/memberModel.js";
import Trainer from "../models/trainerModel.js";
import Session from "../models/gymPlans/sessionModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import MemberPlan from "../models/gymPlans/memberPlanModel.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

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
