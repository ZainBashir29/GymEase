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
