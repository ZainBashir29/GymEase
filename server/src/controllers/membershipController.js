import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import MembershipPlan from "../models/membershipPlanModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";

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

const createPendingMembershipSubscription = asyncHandler(async (req, res) => {
  const { membershipPlanId } = req.body;

  if (!membershipPlanId) {
    throw new ApiError(400, "Membership plan id is required");
  }

  const existingMembershipSubscription = await MembershipSubscription.findOne({
    memberId: req.user?._id,
    status: "active",
  });

  if (existingMembershipSubscription) {
    throw new ApiError(
      400,
      "You already have an active membership subscription",
    );
  }

  const existingPendingMembershipSubscription =
    await MembershipSubscription.findOne({
      memberId: req.user?._id,
      status: "pending",
    });

  if (existingPendingMembershipSubscription) {
    throw new ApiError(
      400,
      "You already have a pending membership subscription. Complete payment to activate it.",
    );
  }

  const membershipPlan = await MembershipPlan.findById(membershipPlanId);

  if (!membershipPlan) {
    throw new ApiError(404, "Invalid membership plan id");
  }

  const pendingMembershipSubscription = await MembershipSubscription.create({
    membershipPlanId,
    memberId: req.user?._id,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
      $addFields: {
        member: {
          $first: "$member",
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
  const subscriptions = await MemberSubscription.aggregate([
    {
      $match: {
        memberId: new mongoose.Types.ObjectId(req.user?._id),
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
      $addFields: {
        member: {
          $first: "$member",
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
      status: active,
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

export {
  getAllMembershipPlans,
  getMembershipPlanById,
  createPendingMembershipSubscription,
  getCurrentMembershipSubscription,
  getSubscriptionHistory,
};
