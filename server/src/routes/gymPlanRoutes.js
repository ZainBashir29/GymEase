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
  markSessionConductedByTrainer,
} from "../controllers/gymPlanController.js";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import requireActiveMembership from "../middlewares/requireActiveMembershipMiddleware.js";

const router = Router();

router.route("/").get(getAllPopularPlans);

router.route("/active").get(verifyJwt, role("Member"), getActiveMemberPlan);

router
  .route("/member-history")
  .get(verifyJwt, role("Member"), getMemberPlanHistory);

router
  .route("/custom/activate")
  .post(verifyJwt, role("Member"), activateCustomPlan);

router
  .route("/questionnaire")
  .get(verifyJwt, role("Member"), getMemberQuestionnaire);

router
  .route("/sessions/member/today")
  .get(verifyJwt, role("Member"), getMemberTodaySession);

router
  .route("/sessions/trainer/today")
  .get(verifyJwt, role("Trainer"), getTrainerTodaySessions);

router
  .route("/sessions/trainer")
  .get(verifyJwt, role("Trainer"), getTrainerAllSessions);

router.route("/:gymPlanId").get(getPlanById);

router
  .route("/activate/:gymPlanId")
  .post(verifyJwt, role("Member"), activatePopularPlan);

router
  .route("/cancel/:memberPlanId")
  .post(verifyJwt, role("Member"), cancelMemberPlan);

router
  .route("/sessions/mark-completed/:id")
  .post(
    verifyJwt,
    role("Member", "Trainer"),
    requireActiveMembership,
    markSessionComplete,
  );

router
  .route("/sessions/mark-conducted/:id")
  .post(verifyJwt, role("Trainer"), markSessionConductedByTrainer);

router
  .route("/sessions/:memberPlanId")
  .get(verifyJwt, role("Member", "Trainer", "Admin"), getAllSessionsForPlan);

export default router;
