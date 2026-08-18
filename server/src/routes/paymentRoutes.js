import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import role from "../middlewares/roleMiddleware.js";
import {
  createCheckoutUrl,
  verifyPaymentStatus,
  refundPayment,
} from "../controllers/paymentController.js";

const router = Router();

router.route("/initiate").post(verifyJwt, role("Member"), createCheckoutUrl);

router
  .route("/verify/:tracker")
  .post(verifyJwt, role("Member"), verifyPaymentStatus);

router
  .route("/refund/:paymentId")
  .post(verifyJwt, role("Member"), refundPayment);

export default router;
