import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Payment from "../models/paymentModel.js";
import Order from "../models/orderModel.js";
import MembershipPlan from "../models/membershipPlanModel.js";
import {
  approveReviewedPayment,
  refundReviewedPayment,
  rejectReviewedPayment,
} from "../services/paymentOutcomeHandlers.js";

const MAX_NOTE_LENGTH = 500;

/**
 * Attaches a lightweight `cause` (order or membership plan summary) to each
 * payment. Done manually because Payment.paymentCauseId uses refPath values
 * that do not match model names.
 */
const attachPaymentCauses = async (payments) => {
  const orderIds = payments
    .filter((p) => p.type === "StoreOrder")
    .map((p) => p.paymentCauseId);
  const planIds = payments
    .filter((p) => p.type === "MembershipSubscription")
    .map((p) => p.paymentCauseId);

  const [orders, plans] = await Promise.all([
    orderIds.length
      ? Order.find({ _id: { $in: orderIds } })
          .select("totalAmount orderStatus paymentStatus products createdAt")
          .populate("products.productId", "name")
          .lean()
      : [],
    planIds.length
      ? MembershipPlan.find({ _id: { $in: planIds } })
          .select("name price duration")
          .lean()
      : [],
  ]);

  const byId = new Map(
    [...orders, ...plans].map((doc) => [String(doc._id), doc]),
  );

  return payments.map((p) => ({
    ...p,
    cause: byId.get(String(p.paymentCauseId)) || null,
  }));
};

const listReviewPayments = asyncHandler(async (req, res) => {
  const view = req.query.status === "resolved" ? "resolved" : "review";
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

  const filter =
    view === "review"
      ? { status: "review" }
      : { "resolution.action": { $ne: null } };

  const sort = view === "review" ? { createdAt: -1 } : { "resolution.resolvedAt": -1 };

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("memberId", "fullName email")
      .populate("resolution.resolvedBy", "fullName email")
      .lean(),
    Payment.countDocuments(filter),
  ]);

  const withCauses = await attachPaymentCauses(payments);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        payments: withCauses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(Math.ceil(total / limit), 1),
        },
      },
      "Payments fetched successfully",
    ),
  );
});

const getReviewPaymentsCount = asyncHandler(async (req, res) => {
  const count = await Payment.countDocuments({ status: "review" });
  res
    .status(200)
    .json(new ApiResponse(200, { count }, "Review count fetched successfully"));
});

const resolveReviewPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const note = typeof req.body.note === "string" ? req.body.note.trim() : "";

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid payment id");
  }

  if (!["approve", "refund", "reject"].includes(action)) {
    throw new ApiError(400, "Action must be one of: approve, refund, reject");
  }

  if ((action === "refund" || action === "reject") && !note) {
    throw new ApiError(400, "A note is required to refund or reject a payment");
  }

  if (note.length > MAX_NOTE_LENGTH) {
    throw new ApiError(400, `Note must be at most ${MAX_NOTE_LENGTH} characters`);
  }

  const handlers = {
    approve: approveReviewedPayment,
    refund: refundReviewedPayment,
    reject: rejectReviewedPayment,
  };

  const resolved = await handlers[action](id, req.user._id, note);

  const messages = {
    approve: "Payment approved and fulfilled",
    refund: "Payment refunded successfully",
    reject: "Payment rejected",
  };

  res.status(200).json(new ApiResponse(200, resolved, messages[action]));
});

export { listReviewPayments, getReviewPaymentsCount, resolveReviewPayment };
