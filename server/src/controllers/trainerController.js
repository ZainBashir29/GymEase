import mongoose from "mongoose";
import Trainer from "../models/trainerModel.js";
import Session from "../models/gymPlans/sessionModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const getTrainerById = asyncHandler(async (req, res) => {
  const trainer = await Trainer.findById(req.user?._id).select(
    "-password -refreshToken -isProfileCompleted refreshPasswordToken refreshPasswordExpiry",
  );

  if (!trainer) {
    throw new ApiError(404, "Trainer not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, trainer, "Trainer fetched successfully"));
});

const getAssignedMembers = asyncHandler(async (req, res) => {
  const trainerId = req.user?._id;
  const { scope } = req.query;

  const matchStage = { trainerId: new mongoose.Types.ObjectId(trainerId) };

  if (scope !== "all") {
    matchStage.status = "upcoming";
  }

  const members = await Session.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$memberId",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "memberDetails",
      },
    },
    { $unwind: "$memberDetails" },
    {
      $project: {
        _id: "$memberDetails._id",
        fullName: "$memberDetails.fullName",
        email: "$memberDetails.email",
        profilePicture: "$memberDetails.profilePicture",
        age: "$memberDetails.age",
        username: "$memberDetails.username",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalMembers: members.length, members },
        "Assigned members fetched successfully",
      ),
    );
});

export { getTrainerById, getAssignedMembers };
