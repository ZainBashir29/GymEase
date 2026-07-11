import { Router } from "express";

import verifyJwt from "../middlewares/authMiddleware.js";

import {
    createSession,
    getTrainerSessions,
    updateSessionStatus,
    getMemberTodaySession,
} from "../controllers/sessionController.js";

const router = Router();

/* Create a new session */
router
    .route("/create")
    .post(
        verifyJwt,
        createSession
    );

/* Get trainer sessions */
router
    .route("/trainer")
    .get(
        verifyJwt,
        getTrainerSessions
    );

/* Update session status */
router
    .route("/:sessionId/status")
    .patch(
        verifyJwt,
        updateSessionStatus
    );

/* Get member today's session */
router
    .route("/member/today")
    .get(
        verifyJwt,
        getMemberTodaySession
    );

export default router;