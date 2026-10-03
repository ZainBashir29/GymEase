import { Router } from "express";
import {
  createMembershipSubscription,
  getAllMembershipPlans,
  getCurrentMembershipSubscription,
  getMembershipPlanById,
  getSubscriptionHistory,
  cancelMembershipSubscription,
  renewMembershipSubscription,
  verifyMembership,
  checkInMemberByVerificationId,
} from "../controllers/membershipController.js";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";

const router = Router();

router.route("/plans").get(getAllMembershipPlans);

router.route("/plan/:membershipPlanId").get(getMembershipPlanById);

router
  .route("/create")
  .post(verifyJwt, role("Member"), createMembershipSubscription);

router
  .route("/current")
  .get(verifyJwt, role("Member"), getCurrentMembershipSubscription);

router.route("/history").get(verifyJwt, role("Member"), getSubscriptionHistory);

router
  .route("/cancel")
  .post(verifyJwt, role("Member"), cancelMembershipSubscription);

router
  .route("/renew")
  .post(verifyJwt, role("Member"), renewMembershipSubscription);

router.route("/verify/:id").get(verifyMembership);

router
  .route("/verify/check-in/:id")
  .post(verifyJwt, role("Admin", "Trainer"), checkInMemberByVerificationId);

export default router;
