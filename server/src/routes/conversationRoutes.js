import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import requireActiveMembership from "../middlewares/requireActiveMembershipMiddleware.js";
import {
  createConversation,
  getMyConversations,
  getPotentialContacts,
} from "../controllers/conversationController.js";

const router = Router();

router
  .route("/create")
  .post(
    verifyJwt,
    role("Member", "Trainer", "Admin"),
    createConversation,
  );

router
  .route("/me")
  .get(
    verifyJwt,
    role("Member", "Trainer", "Admin"),
    getMyConversations,
  );

router
  .route("/contacts")
  .get(verifyJwt, role("Member", "Trainer", "Admin"), getPotentialContacts);

export default router;
