import { Router } from "express";
import {
  createPendingMembershipSubscription,
  getAllMembershipPlans,
  getCurrentMembershipSubscription,
  getMembershipPlanById,
  getSubscriptionHistory,
} from "../controllers/membershipController.js";

const router = Router();

router.route("/membership-plans").get(getAllMembershipPlans);

router.route("/membership-plan/:membershipPlanId").get(getMembershipPlanById);

router
  .route("/create-pending-subscription")
  .post(createPendingMembershipSubscription);

router.route("/current-membership").get(getCurrentMembershipSubscription);

router.route("/subscription-history").get(getSubscriptionHistory);

export default router;
