import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Attendance from "../models/attendanceModel.js";

const markAttendance = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const role = req.user?.role;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const existingAttendance = await Attendance.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  if (existingAttendance) {
    throw new ApiError(400, "Attendance already marked for today");
  }

  const attendance = await Attendance.create({
    role,
    userId,
    status: "present",
    date: new Date(),
  });

  res
    .status(201)
    .json(new ApiResponse(201, attendance, "Attendance marked successfully"));
});

const getMyAttendance = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const records = await Attendance.find({ userId }).sort({ date: -1 });

  res
    .status(200)
    .json(
      new ApiResponse(200, records, "Attendance history fetched successfully"),
    );
});

const getTodayAttendanceStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayRecord = await Attendance.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { marked: !!todayRecord, record: todayRecord || null },
        "Today's attendance status fetched successfully",
      ),
    );
});

export { markAttendance, getMyAttendance, getTodayAttendanceStatus };
