import { Router } from "express";

import verifyJwt from "../middlewares/authMiddleware.js";

import {
    createConversation,
    getMyConversations,
} from "../controllers/conversationController.js";

const router = Router();

/* Create conversation */
router
    .route("/create")
    .post(
        verifyJwt,
        createConversation
    );

/* Get my conversations */
router
    .route("/my-conversations")
    .get(
        verifyJwt,
        getMyConversations
    );

export default router;