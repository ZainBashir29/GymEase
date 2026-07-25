import express from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import {
  getTrainerProfile,
  getAssignedMembers,
} from "../controllers/trainerController.js";

const router = express.Router();

router.get("/me", verifyJwt, role("Trainer"), getTrainerProfile);

router.get("/me/members", verifyJwt, role("Trainer"), getAssignedMembers);

export default router;
