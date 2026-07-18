import { Router } from "express";
import {
  activateCustomPlan,
  activatePopularPlan,
  cancelMemberPlan,
  getActiveMemberPlan,
  getAllPopularPlans,
  getAllSessionsForPlan,
  getMemberPlanHistory,
  getMemberQuestionnaire,
  getMemberTodaySession,
  getPlanById,
  getTrainerAllSessions,
  getTrainerTodaySessions,
  markSessionComplete,
} from "../controllers/gymPlanController.js";
import verifyJwt from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/").get(getAllPopularPlans);

router.route("/:id").get(getPlanById);

router.route("/activate/:id").post(verifyJwt, activatePopularPlan);

router.route("/active").get(verifyJwt, getActiveMemberPlan);

router.route("/member-history").get(verifyJwt, getMemberPlanHistory);

router.route("/cancel/:id").post(verifyJwt, cancelMemberPlan);

router.route("/custom/activate").post(verifyJwt, activateCustomPlan);

router.route("/questionnaire").get(verifyJwt, getMemberQuestionnaire);

router.route("/sessions/member/today").get(verifyJwt, getMemberTodaySession);

router.route("/sessions/trainer/today").get(verifyJwt, getTrainerTodaySessions);

router.route("/sessions/:id").get(verifyJwt, getAllSessionsForPlan);

router.route("/sessions/trainer").get(verifyJwt, getTrainerAllSessions);

router.route("/sessions/:id/complete").post(verifyJwt, markSessionComplete);

export default router;
