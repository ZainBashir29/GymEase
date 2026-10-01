import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const requireActiveMembership = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "Member") {
    return next();
  }

  const activeSubscription = await MembershipSubscription.findOne({
    memberId: req.user?._id,
    status: "active",
    endDate: { $gt: new Date() },
  });

  if (!activeSubscription) {
    throw new ApiError(
      403,
      "An active membership is required to access this feature. Please purchase a membership plan.",
    );
  }

  next();
});

export default requireActiveMembership;
