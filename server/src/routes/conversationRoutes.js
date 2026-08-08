import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import {
  createConversation,
  getMyConversations,
} from "../controllers/conversationController.js";

const router = Router();

router
  .route("/create")
  .post(verifyJwt, role("Member", "Trainer", "Admin"), createConversation);

router
  .route("/me")
  .get(verifyJwt, role("Member", "Trainer", "Admin"), getMyConversations);

export default router;
