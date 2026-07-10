import { Router } from "express";

import verifyJwt from "../middlewares/authMiddleware.js";

import {
    getMemberProgress,
} from "../controllers/progressController.js";

const router = Router();

/* Get member progress */
router
    .route("/my-progress")
    .get(
        verifyJwt,
        getMemberProgress
    );

export default router;