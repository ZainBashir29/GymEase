import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import {
  createCheckoutUrl,
  refundPayment,
  verifyPaymentStatus,
} from "../controllers/paymentController.js";

const router = Router();

router.route("/initiate").post(verifyJwt, createCheckoutUrl);
router.route("/verify/:trackerToken").post(verifyJwt, verifyPaymentStatus);
router.route("/refund/:paymentId").post(verifyJwt, refundPayment);

export default router;
