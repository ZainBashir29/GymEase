import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import warnExpiringMemberships from "../crons/warnExpiringMemberships.js";
import expireMemberships from "../crons/expireMemberships.js";
import markMissedSessions from "../crons/markMissedSessions.js";
import completeFinishedMemberPlans from "../crons/completeFinishedMemberPlans.js";
import reconcilePayments from "../crons/reconcilePayments.js";
import markAbsentees from "../crons/markAbsentees.js";

const router = express.Router();

const verifyCronSecret = (req, res, next) => {
  if (req.headers["x-cron-secret"] !== process.env.CRON_SECRET) {
    throw new ApiError(401, "Unauthorized");
  }
  next();
};

router.post(
  "/daily",
  verifyCronSecret,
  asyncHandler(async (req, res) => {
    await warnExpiringMemberships();
    await expireMemberships();
    await markMissedSessions();
    await completeFinishedMemberPlans();
    await markAbsentees();
    res.status(200).json(new ApiResponse(200, {}, "Daily jobs completed"));
  }),
);

router.post(
  "/reconcile-payments",
  verifyCronSecret,
  asyncHandler(async (req, res) => {
    await reconcilePayments();
    res.status(200).json(new ApiResponse(200, {}, "Reconciliation completed"));
  }),
);

export default router;
