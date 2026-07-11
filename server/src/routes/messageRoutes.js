import { Router } from "express";

import verifyJwt from "../middlewares/authMiddleware.js";

import {
    sendMessage,
    getConversationMessages,
    markMessagesAsRead,
} from "../controllers/messageController.js";

const router = Router();

/* Send Message */
router
    .route("/send")
    .post(
        verifyJwt,
        sendMessage
    );

/* Get Messages of Conversation */
router
    .route("/:conversationId")
    .get(
        verifyJwt,
        getConversationMessages
    );

/* Mark Messages as Read */
router
    .route("/read/:conversationId")
    .patch(
        verifyJwt,
        markMessagesAsRead
    );

export default router;