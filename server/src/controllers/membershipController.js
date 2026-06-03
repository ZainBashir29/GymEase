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

const createMembershipSubscription = asyncHandler(async (req, res) => {
  const { membershipPlanId } = req.body;

  if (!membershipPlanId) {
    throw new ApiError(400, "Membership plan id is required");
  }

  const memebershipPlan = await MembershipPlan.findById(memebershipPlanId);

  if (!memebershipPlan) {
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

export { getAllMembershipPlans, createMembershipSubscription };
