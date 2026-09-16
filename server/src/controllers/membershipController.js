import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import MembershipPlan from "../models/membershipPlanModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import Attendance from "../models/attendanceModel.js";
import { createCheckoutUrl } from "./paymentController.js";

const getAllMembershipPlans = asyncHandler(async (req, res) => {
  const membershipPlans = await MembershipPlan.find({});

  if (!membershipPlans) {
    throw new ApiError(500, "Could not fetch membership plans");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        membershipPlans,
        "Membership Plans fetched successfully",
      ),
    );
});

const getMembershipPlanById = asyncHandler(async (req, res) => {
  const { membershipPlanId } = req.params;

  if (!membershipPlanId) {
    throw new ApiError(400, "Membership plan id is required");
  }

  const membershipPlan = await MembershipPlan.findById(membershipPlanId);

  if (!membershipPlan) {
    throw new ApiError(404, "Could not find membership plan");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        membershipPlan,
        "Membership plan fetched successfully",
      ),
    );
});

const createMembershipSubscription = asyncHandler(async (req, res) => {
  const { membershipPlanId } = req.body;

  if (!membershipPlanId) {
    throw new ApiError(400, "Membership plan id is required");
  }

  const existingMembershipSubscription = await MembershipSubscription.findOne({
    memberId: req.user?._id,
    status: "active",
  });

  await MembershipSubscription.deleteMany({
    memberId: req.user?._id,
    status: "pending",
  });

  const membershipPlan = await MembershipPlan.findById(membershipPlanId);

  if (!membershipPlan) {
    throw new ApiError(404, "Invalid membership plan id");
  }

  let startDate = new Date();
  if (
    existingMembershipSubscription &&
    existingMembershipSubscription.endDate > startDate
  ) {
    startDate = new Date(existingMembershipSubscription.endDate);
  }

  const endDate = new Date(
    startDate.getTime() + membershipPlan.duration * 24 * 60 * 60 * 1000,
  );

  const pendingMembershipSubscription = await MembershipSubscription.create({
    membershipPlanId,
    memberId: req.user?._id,
    startDate,
    endDate,
    status: "pending",
  });

  if (!pendingMembershipSubscription) {
    throw new ApiError(500, "Could not create pending membership subscription");
  }

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        pendingMembershipSubscription,
        "Pending membership subscription created successfully",
      ),
    );
});

const getCurrentMembershipSubscription = asyncHandler(async (req, res) => {
  const membershipSubscription = await MembershipSubscription.aggregate([
    {
      $match: {
        memberId: new mongoose.Types.ObjectId(req.user?._id),
        status: "active",
      },
    },
    {
      $lookup: {
        from: "members",
        localField: "memberId",
        foreignField: "_id",
        as: "member",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              email: 1,
              profilePicture: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "membershipplans",
        localField: "membershipPlanId",
        foreignField: "_id",
        as: "membershipPlanId",
      },
    },
    {
      $addFields: {
        member: {
          $first: "$member",
        },
        membershipPlanId: {
          $first: "$membershipPlanId",
        },
      },
    },
  ]);

  if (!membershipSubscription.length) {
    throw new ApiError(404, "No current membership subscription found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        membershipSubscription[0],
        "Current membership subscription fetched successfully",
      ),
    );
});

const getSubscriptionHistory = asyncHandler(async (req, res) => {
  const subscriptions = await MembershipSubscription.aggregate([
    {
      $match: {
        memberId: new mongoose.Types.ObjectId(req.user?._id),
        status: { $ne: "pending" },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "members",
        localField: "memberId",
        foreignField: "_id",
        as: "member",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              email: 1,
              profilePicture: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "membershipplans",
        localField: "membershipPlanId",
        foreignField: "_id",
        as: "membershipPlanId",
      },
    },
    {
      $addFields: {
        member: {
          $first: "$member",
        },
        membershipPlanId: {
          $first: "$membershipPlanId",
        },
      },
    },
  ]);

  if (!subscriptions.length) {
    throw new ApiError(404, "No subscription history found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptions,
        "Subscription history fetched successfully",
      ),
    );
});

const cancelMembershipSubscription = asyncHandler(async (req, res) => {
  const cancelledSubscripton = await MembershipSubscription.findOneAndUpdate(
    {
      memberId: req.user?._id,
      status: "active",
    },
    {
      $set: {
        status: "cancelled",
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!cancelledSubscripton) {
    throw new ApiError(500, "Could not cancel membership subscription");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        cancelledSubscripton,
        "Membership subscription cancelled successfully",
      ),
    );
});

const renewMembershipSubscription = asyncHandler(async (req, res) => {
  const { membershipPlanId } = req.body;

  const currentMembershipSubscription = await MembershipSubscription.findOne({
    memberId: req.user?._id,
    status: { $in: ["active", "expired", "cancelled"] },
  }).sort({ createdAt: -1 });

  if (!currentMembershipSubscription) {
    throw new ApiError(404, "Current membership subscription not found");
  }

  const membershipPlan = await MembershipPlan.findById(
    membershipPlanId || currentMembershipSubscription.membershipPlanId,
  );

  if (!membershipPlan) {
    throw new ApiError(404, "Membership plan not found");
  }

  const now = new Date();

  const startDate =
    currentMembershipSubscription.endDate &&
    currentMembershipSubscription.endDate > now
      ? new Date(currentMembershipSubscription.endDate)
      : now;

  const endDate = new Date(startDate);

  endDate.setMonth(endDate.getMonth() + 1);

  const updatedSubscriptionRecord =
    await MembershipSubscription.findOneAndUpdate(
      {
        memberId: req.user?._id,
        status: "pending",
      },
      {
        $set: {
          membershipPlanId: membershipPlan._id,
          startDate,
          endDate,
        },
      },
      {
        returnDocument: "after",
      },
    );

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        updatedSubscriptionRecord,
        "Updated renewal membership subscription data successfully",
      ),
    );
});

const verifyMembership = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid verification ID");
  }

  const membership = await MembershipSubscription.findById(id)
    .populate("memberId", "fullName email profilePicture")
    .populate("membershipPlanId", "name");

  if (!membership) {
    throw new ApiError(404, "Membership not found");
  }

  const isActive =
    new Date(membership.endDate) > new Date() &&
    membership.status !== "cancelled";

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayAttendance = await Attendance.findOne({
    userId: membership.memberId?._id,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        isValid: isActive,
        user: membership.memberId,
        plan: membership.membershipPlanId,
        endDate: membership.endDate,
        startDate: membership.startDate,
        status: membership.status,
        isCheckedInToday: !!todayAttendance,
        checkedInAt: todayAttendance?.date || null,
      },
      isActive ? "Active membership" : "Expired or cancelled membership",
    ),
  );
});

const checkInMemberByVerificationId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid verification ID");
  }

  const membership = await MembershipSubscription.findById(id).populate(
    "memberId",
    "fullName email profilePicture",
  );

  if (!membership) {
    throw new ApiError(404, "Membership not found");
  }

  const isActive =
    new Date(membership.endDate) > new Date() &&
    membership.status !== "cancelled";

  if (!isActive) {
    throw new ApiError(
      400,
      "Cannot check in: membership is expired or inactive",
    );
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const existingAttendance = await Attendance.findOne({
    userId: membership.memberId?._id,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (existingAttendance) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          alreadyCheckedIn: true,
          attendance: existingAttendance,
        },
        "Member is already checked in for today",
      ),
    );
  }

  const attendance = await Attendance.create({
    role: "Member",
    userId: membership.memberId._id,
    status: "present",
    date: new Date(),
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        alreadyCheckedIn: false,
        attendance,
      },
      `Member ${membership.memberId?.fullName || "Member"} checked in successfully`,
    ),
  );
});

export {
  getAllMembershipPlans,
  getMembershipPlanById,
  createMembershipSubscription,
  getCurrentMembershipSubscription,
  getSubscriptionHistory,
  cancelMembershipSubscription,
  renewMembershipSubscription,
  verifyMembership,
  checkInMemberByVerificationId,
};
