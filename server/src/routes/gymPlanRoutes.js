import { Router } from "express";
import {
  activatePopularPlan,
  getAllPopularPlans,
  getPlanById,
} from "../controllers/gymPlanController.js";

const router = Router();

router.route("/").get(getAllPopularPlans);

router.route("/:id").get(getPlanById);

router.route("/:id/activate").post(activatePopularPlan);


export default router;
