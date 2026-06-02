import { Router } from "express";
import verifyJwt from "../middlewares/authMiddleware.js";
import {
  createCheckoutUrl,
  verifyPaymentStatus,
} from "../controllers/paymentController.js";

const router = Router();

router.route("/initiate").post(verifyJwt, createCheckoutUrl);
router.route("/verify/:token").post(verifyJwt, verifyPaymentStatus);

export default router;
