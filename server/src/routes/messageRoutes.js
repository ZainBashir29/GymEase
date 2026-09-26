import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import requireActiveMembership from "../middlewares/requireActiveMembershipMiddleware.js";
import {
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
} from "../controllers/messageController.js";
import { requirePermissionIfAdmin } from "../middlewares/permissionMiddleware.js";

const router = Router();

router
  .route("/send")
  .post(verifyJwt, role("Member", "Trainer", "Admin"), requirePermissionIfAdmin("manage_messages"), sendMessage);

router
  .route("/:conversationId")
  .get(verifyJwt, role("Member", "Trainer", "Admin"), requirePermissionIfAdmin("manage_messages"), getConversationMessages);

router
  .route("/read/:conversationId")
  .patch(verifyJwt, role("Member", "Trainer", "Admin"), requirePermissionIfAdmin("manage_messages"), markMessagesAsRead);

export default router;
