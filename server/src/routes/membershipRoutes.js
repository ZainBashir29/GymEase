import { Router } from "express";
import {
  createMembershipSubscription,
  getAllMembershipPlans,
  getCurrentMembershipSubscription,
  getMembershipPlanById,
  getSubscriptionHistory,
  cancelMembershipSubscription,
  renewMembershipSubscription,
} from "../controllers/membershipController.js";
import verifyJwt from "../middlewares/authMiddleware.js"

const router = Router();

router.route("/membership-plans").get(getAllMembershipPlans);

router.route("/membership-plan/:membershipPlanId").get(getMembershipPlanById);

router
  .route("/create")
  .post(verifyJwt, createMembershipSubscription);

router.route("/current").get(verifyJwt, getCurrentMembershipSubscription);

router.route("/history").get(verifyJwt, getSubscriptionHistory);

router.route("/cancel").post(verifyJwt, cancelMembershipSubscription);

router.route("/renew").post(verifyJwt, renewMembershipSubscription);

export default router;
