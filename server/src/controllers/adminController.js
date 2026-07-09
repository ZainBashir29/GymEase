import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Member from "../models/memberModel.js";
import Trainer from "../models/trainerModel.js";

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
