import mongoose from "mongoose";
import Trainer from "../models/trainerModel.js";
import Session from "../models/gymPlans/sessionModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const getTrainerProfile = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findById(req.user?._id).select(
    "-password -refreshToken -isProfileCompleted refreshPasswordToken refreshPasswordExpiry",
  );

  if (!trainer) {
    throw new ApiError(404, "Trainer not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, trainer, "Trainer profile fetched successfully"),
    );
});

const getAssignedMembers = asyncHandler(async (req, res) => {
  const trainerId = req.user?._id;
  const { scope } = req.query;

  const filter = { trainerId };
  if (scope !== "all") {
    filter.status = "upcoming";
  }

  const memberIds = await Session.distinct("memberId", filter);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalMembers: memberIds.length, memberIds },
        "Assigned members fetched successfully",
      ),
    );
});

export { getTrainerProfile, getAssignedMembers };
