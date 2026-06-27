import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import GymPlan from "../models/gymPlans/gymPlanModel.js";

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