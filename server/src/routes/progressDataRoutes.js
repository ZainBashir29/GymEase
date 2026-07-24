import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import {
  getMemberProgress,
  getTrainerProgress,
} from "../controllers/progressDataController.js";

const router = Router();

router.use(verifyJwt);

router.route("/member").get(role("Member"), getMemberProgress);
router.route("/trainer").get(role("Trainer"), getTrainerProgress);

export default router;
