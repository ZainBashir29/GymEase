import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import {
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
} from "../controllers/messageController.js";

const router = Router();

router
  .route("/send")
  .post(verifyJwt, role("Member", "Trainer", "Admin"), sendMessage);

router
  .route("/:conversationId")
  .get(verifyJwt, role("Member", "Trainer", "Admin"), getConversationMessages);

router
  .route("/read/:conversationId")
  .patch(verifyJwt, role("Member", "Trainer", "Admin"), markMessagesAsRead);

export default router;
