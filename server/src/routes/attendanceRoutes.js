import { Router } from "express";

import verifyJwt from "../middlewares/authMiddleware.js";

import {
    markAttendance,
    getTrainerAttendance,
    getMemberAttendance,
} from "../controllers/attendanceController.js";

const router = Router();

/* Mark attendance */
router
    .route("/mark")
    .post(
        verifyJwt,
        markAttendance
    );

/* Get trainer attendance */
router
    .route("/trainer")
    .get(
        verifyJwt,
        getTrainerAttendance
    );

/* Get member attendance */
router
    .route("/member")
    .get(
        verifyJwt,
        getMemberAttendance
    );

export default router;
