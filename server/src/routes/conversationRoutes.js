import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import requireActiveMembership from "../middlewares/requireActiveMembershipMiddleware.js";
import {
  createConversation,
  getMyConversations,
  getPotentialContacts,
} from "../controllers/conversationController.js";
import { requirePermissionIfAdmin } from "../middlewares/permissionMiddleware.js";

const router = Router();

router
  .route("/create")
  .post(
    verifyJwt,
    role("Member", "Trainer", "Admin"),
    requirePermissionIfAdmin("manage_messages"),
    createConversation,
  );

router
  .route("/me")
  .get(
    verifyJwt,
    role("Member", "Trainer", "Admin"),
    requirePermissionIfAdmin("manage_messages"),
    getMyConversations,
  );

router
  .route("/contacts")
  .get(
    verifyJwt,
    role("Member", "Trainer", "Admin"),
    requirePermissionIfAdmin("manage_messages"),
    getPotentialContacts,
  );

export default router;
