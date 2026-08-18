import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import requireActiveMembership from "../middlewares/requireActiveMembershipMiddleware.js";
import {
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
} from "../controllers/messageController.js";

const router = Router();

router
  .route("/send")
  .post(verifyJwt, role("Member", "Trainer", "Admin"), requireActiveMembership, sendMessage);

router
  .route("/:conversationId")
  .get(verifyJwt, role("Member", "Trainer", "Admin"), requireActiveMembership, getConversationMessages);

router
  .route("/read/:conversationId")
  .patch(verifyJwt, role("Member", "Trainer", "Admin"), requireActiveMembership, markMessagesAsRead);

export default router;
