import express from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import {
  markAttendance,
  getMyAttendance,
  getTodayAttendanceStatus,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.use(verifyJwt, role("Member", "Trainer"));

router.route("/mark").post(markAttendance);

router.route("/me").get(getMyAttendance);

router.route("/today-status").get(getTodayAttendanceStatus);

export default router;
