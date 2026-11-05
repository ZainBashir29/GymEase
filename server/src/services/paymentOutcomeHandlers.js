import Payment from "../models/paymentModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import MembershipPlan from "../models/membershipPlanModel.js";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import StoreProduct from "../models/storeProductModel.js";
import Safepay from "@sfpy/node-core";
import sendEmail from "./nodemailer.js";
import {
  getMembershipReceiptEmail,
  getStoreOrderEmail,
} from "../utils/emailTemplates.js";
import { resumePausedMemberPlan } from "../controllers/gymPlanController.js";
import { fetchSafepayChargedAmount } from "./safepay.js";
import ApiError from "../utils/ApiError.js";

const safepay = Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: "secret",
  host: "https://sandbox.api.getsafepay.com",
});

const getMembershipPaymentType = async (memberId, planId) => {
  const existingActiveMembership = await MembershipSubscription.findOne({
    memberId,
    status: "active",
  }).populate("membershipPlanId", "_id");

  if (existingActiveMembership) {
    return existingActiveMembership.membershipPlanId?._id.toString() ===
      String(planId)
      ? "renewal"
      : "plan_change";
  }

  const hasPreviousMembership = await MembershipSubscription.exists({
    memberId,
    status: { $in: ["expired", "cancelled"] },
  });

  if (hasPreviousMembership) {
    return "returning_member";
  }

  return "new_membership";
};

/**
 * Independently verifies a pending payment before it is fulfilled.
 * Returns null when everything checks out, otherwise a human-readable reason
 * explaining why the payment must be held for admin review.
 */
const verifyPaymentBeforeFulfilment = async (payment) => {
  // 1. SafePay amount check: the amount SafePay actually recorded must match
  //    the amount we expected to charge (stored in rupees, SafePay uses paisa).
  let charged;
  try {
    charged = await fetchSafepayChargedAmount(payment.trackerToken);
  } catch (error) {
    // Network/API error: throw so the payment stays "pending" and is retried
    // by the webhook, verify endpoint, or reconcile cron.
    throw new Error(
      `Could not fetch SafePay amount for tracker ${payment.trackerToken}: ${error?.message}`,
    );
  }

  if (!charged) {
    return "SafePay did not report a charged amount for this tracker";
  }

  const expectedPaisa = Math.round(Number(payment.amount) * 100);
  if (charged.amount !== expectedPaisa) {
    return `SafePay charged amount ${charged.amount} paisa does not match expected ${expectedPaisa} paisa`;
  }

  if (charged.currency && charged.currency !== "PKR") {
    return `Unexpected SafePay currency ${charged.currency}`;
  }

  // 2. Store order checks: ownership, state, and total must match the payment.
  if (payment.type === "StoreOrder") {
    const order = await Order.findById(payment.paymentCauseId).select(
      "memberId paymentStatus totalAmount",
    );

    if (!order) {
      return `Order ${payment.paymentCauseId} not found`;
    }

    if (String(order.memberId) !== String(payment.memberId)) {
      return `Order ${order._id} does not belong to paying member ${payment.memberId}`;
    }

    if (order.paymentStatus !== "pending") {
      return `Order ${order._id} is not awaiting payment (paymentStatus: ${order.paymentStatus})`;
    }

    if (Math.round(order.totalAmount * 100) !== expectedPaisa) {
      return `Payment amount ${payment.amount} does not match order total ${order.totalAmount}`;
    }
  }

  return null;
};

/**
 * Fulfils a membership payment that has already been marked "successful".
 * `payment.memberId` must be populated (fullName, email).
 */
const fulfilMembershipPayment = async (payment) => {
  const memberId = payment.memberId._id;

  const existingActiveSub = await MembershipSubscription.findOne({
    memberId,
    status: "active",
  }).populate("membershipPlanId", "name");

  // Determine the payment type before the old subscription is cancelled.
  const membershipPaymentType =
    payment.membershipPaymentType ||
    (await getMembershipPaymentType(memberId, payment.paymentCauseId));
  payment.membershipPaymentType = membershipPaymentType;

  await MembershipSubscription.updateMany(
    {
      memberId,
      status: "active",
    },
    {
      $set: { status: "cancelled" },
    },
  );

  let activatedSubscription = await MembershipSubscription.findOneAndUpdate(
    {
      membershipPlanId: payment.paymentCauseId,
      memberId,
      status: "pending",
    },
    {
      $set: {
        status: "active",
        paymentId: payment._id,
      },
    },
    { returnDocument: "after" },
  ).populate("membershipPlanId", "name");

  if (!activatedSubscription) {
    activatedSubscription = await MembershipSubscription.findOne({
      paymentId: payment._id,
      status: "active",
    }).populate("membershipPlanId", "name");
  }

  if (!activatedSubscription) {
    activatedSubscription = await MembershipSubscription.findOneAndUpdate(
      {
        memberId,
        status: "pending",
      },
      {
        $set: {
          membershipPlanId: payment.paymentCauseId,
          status: "active",
          paymentId: payment._id,
        },
      },
      { returnDocument: "after" },
    ).populate("membershipPlanId", "name");
  }

  if (!activatedSubscription) {
    const plan = await MembershipPlan.findById(payment.paymentCauseId);
    const durationDays = plan?.duration || 30;
    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + durationDays * 24 * 60 * 60 * 1000,
    );
    activatedSubscription = await MembershipSubscription.create({
      membershipPlanId: payment.paymentCauseId,
      memberId,
      startDate,
      endDate,
      status: "active",
      paymentId: payment._id,
    });
    await activatedSubscription.populate("membershipPlanId", "name");
  }

  const previousPlanName = existingActiveSub?.membershipPlanId?.name;

  const membershipEvent =
    membershipPaymentType === "renewal"
      ? "renewed"
      : membershipPaymentType === "plan_change"
        ? "plan_changed"
        : membershipPaymentType === "returning_member"
          ? "returning_member"
          : "first_purchase";

  const emailContent = getMembershipReceiptEmail({
    userName: payment.memberId.fullName,
    amount: payment.amount,
    paymentId: payment._id.toString(),
    planName: activatedSubscription.membershipPlanId?.name || "Membership",
    startDate: activatedSubscription.startDate,
    endDate: activatedSubscription.endDate,
    membershipEvent,
    previousPlanName,
  });

  sendEmail({
    to: payment.memberId.email,
    ...emailContent,
  }).catch((err) => console.error("Failed to send membership email:", err));

  resumePausedMemberPlan(memberId).catch((err) =>
    console.error("Failed to auto-resume member gym plan after payment:", err),
  );

  return payment;
};

/**
 * Fulfils a store-order payment that has already been marked "successful".
 * `payment.memberId` must be populated (fullName, email).
 */
const fulfilStoreOrderPayment = async (payment) => {
  const order = await Order.findOne({
    _id: payment.paymentCauseId,
    memberId: payment.memberId._id,
    paymentStatus: "pending",
  }).populate("products.productId");

  if (!order) {
    console.error(
      `Pending order not found for payment ${payment._id} (missing, not owned by payer, or already processed)`,
    );
    return payment;
  }

  const decrementedItems = [];
  let stockFailure = null;

  for (const item of order.products) {
    const updatedOrderItem = await StoreProduct.findOneAndUpdate(
      { _id: item.productId._id, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
    );

    if (!updatedOrderItem) {
      stockFailure = item.productId.name;
      break;
    }

    decrementedItems.push({
      productId: item.productId._id,
      quantity: item.quantity,
    });
  }

  if (stockFailure) {
    for (const item of decrementedItems) {
      await StoreProduct.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    try {
      await safepay.orders.payments.refund({
        tracker: payment.trackerToken,
        payload: { currency: "PKR", amount: payment.amount * 100 },
      });
    } catch (error) {
      console.error(`Refund failed for order ${order._id}:`, error?.message);
    }

    await Order.findByIdAndUpdate(order._id, {
      $set: {
        orderStatus: "Cancelled",
        paymentStatus: "refunded",
        paymentId: payment._id,
      },
    });

    console.log(
      `Order ${order._id} cancelled and refunded. ${stockFailure} was out of stock at the processing time.`,
    );

    return payment;
  }

  await Order.findByIdAndUpdate(order._id, {
    $set: {
      paymentStatus: "paid",
      orderStatus: "Processing",
      paymentId: payment._id,
    },
  });

  await Cart.findOneAndUpdate(
    { memberId: order.memberId },
    { $set: { products: [] } },
  );

  const emailContent = getStoreOrderEmail({
    userName: payment.memberId.fullName,
    amount: payment.amount,
    paymentId: payment._id.toString(),
    order,
  });
  sendEmail({
    to: payment.memberId.email,
    ...emailContent,
  }).catch((err) => console.error("Failed to send store order email:", err));

  return payment;
};

const fulfilPayment = async (payment) => {
  if (payment.type === "MembershipSubscription") {
    return fulfilMembershipPayment(payment);
  }
  if (payment.type === "StoreOrder") {
    return fulfilStoreOrderPayment(payment);
  }
  return payment;
};

const handleSuccessfulPayment = async (trackerToken) => {
  // --- Verification gate: runs before the payment is marked successful. ---
  const pendingPayment = await Payment.findOne({ trackerToken, status: "pending" });

  if (pendingPayment) {
    const reviewReason = await verifyPaymentBeforeFulfilment(pendingPayment);

    if (reviewReason) {
      const flaggedPayment = await Payment.findOneAndUpdate(
        { _id: pendingPayment._id, status: "pending" },
        { $set: { status: "review", reviewReason } },
        { returnDocument: "after" },
      );
      console.error(
        `[PAYMENT REVIEW] Payment ${pendingPayment._id} (tracker ${trackerToken}) flagged: ${reviewReason}`,
      );
      return flaggedPayment || (await Payment.findOne({ trackerToken }));
    }
  }

  const updatedPayment = await Payment.findOneAndUpdate(
    { trackerToken, status: "pending" },
    { $set: { status: "successful" } },
    { returnDocument: "after" },
  ).populate("memberId");

  if (!updatedPayment) {
    const existingPayment = await Payment.findOne({ trackerToken }).populate("memberId");

    // Already flagged for review: report it as such (idempotent).
    if (existingPayment && existingPayment.status === "review") {
      return existingPayment;
    }

    if (existingPayment && existingPayment.status === "successful") {
      if (existingPayment.type === "MembershipSubscription") {
        const memberId = existingPayment.memberId?._id || existingPayment.memberId;
        const activeSub = await MembershipSubscription.findOne({
          memberId,
          status: "active",
        });
        if (!activeSub) {
          const plan = await MembershipPlan.findById(existingPayment.paymentCauseId);
          const durationDays = plan?.duration || 30;
          const startDate = new Date();
          const endDate = new Date(
            startDate.getTime() + durationDays * 24 * 60 * 60 * 1000,
          );
          await MembershipSubscription.create({
            membershipPlanId: existingPayment.paymentCauseId,
            memberId,
            startDate,
            endDate,
            status: "active",
            paymentId: existingPayment._id,
          });
        }
      } else if (existingPayment.type === "StoreOrder") {
        const memberId = existingPayment.memberId?._id || existingPayment.memberId;
        await Cart.findOneAndUpdate(
          { memberId },
          { $set: { products: [] } },
        );
      }
      return existingPayment;
    }
    console.error(
      `Could not process payment for tracker ${trackerToken}. It may not exist or is not pending.`,
    );
    return null;
  }

  return fulfilPayment(updatedPayment);
};

/**
 * Undoes the side effects of a payment that will not be fulfilled:
 * removes the pending membership subscription, or cancels the store order.
 * Store orders are only touched while still "pending" so that an order paid
 * by a different payment is never cancelled by mistake.
 */
const cleanupUnfulfilledPayment = async (payment, orderPaymentStatus) => {
  const memberId = payment.memberId?._id || payment.memberId;

  if (payment.type === "MembershipSubscription") {
    await MembershipSubscription.findOneAndDelete({
      membershipPlanId: payment.paymentCauseId,
      memberId,
      status: "pending",
    });
  }

  if (payment.type === "StoreOrder") {
    await Order.findOneAndUpdate(
      { _id: payment.paymentCauseId, paymentStatus: "pending" },
      {
        $set: {
          orderStatus: "Cancelled",
          paymentStatus: orderPaymentStatus,
        },
      },
    );
  }
};

const handleFailedPayment = async (trackerToken) => {
  const updatedPayment = await Payment.findOneAndUpdate(
    { trackerToken, status: "pending" },
    { $set: { status: "failed" } },
    { returnDocument: "after" },
  );

  if (!updatedPayment) {
    const existingPayment = await Payment.findOne({ trackerToken });
    if (existingPayment && existingPayment.status === "failed")
      return existingPayment;
    console.error(
      `Could not process failed payment for tracker ${trackerToken}.`,
    );
    return null;
  }

  if (updatedPayment.type === "MembershipSubscription") {
    updatedPayment.membershipPaymentType =
      updatedPayment.membershipPaymentType ||
      (await getMembershipPaymentType(
        updatedPayment.memberId,
        updatedPayment.paymentCauseId,
      ));
  }

  await cleanupUnfulfilledPayment(updatedPayment, "failed");

  return updatedPayment;
};

const handleRefundedPayment = async (paymentId) => {
  const updatedPayment = await Payment.findOneAndUpdate(
    { _id: paymentId, status: "successful" },
    { $set: { status: "refunded" } },
    { returnDocument: "after" },
  );

  if (!updatedPayment) {
    console.error(`Could not find payment ${paymentId} to mark as refunded`);
    return null;
  }

  if (updatedPayment.type === "MembershipSubscription") {
    await MembershipSubscription.findOneAndUpdate(
      {
        membershipPlanId: updatedPayment.paymentCauseId,
        memberId: updatedPayment.memberId,
      },
      { $set: { status: "cancelled" } },
      { returnDocument: "after" },
    );
  }

  if (updatedPayment.type === "StoreOrder") {
    const order = await Order.findByIdAndUpdate(
      updatedPayment.paymentCauseId,
      {
        $set: {
          orderStatus: "Cancelled",
          paymentStatus: "refunded",
        },
      },
      { returnDocument: "after" },
    ).populate("products.productId");

    if (order) {
      for (const item of order.products) {
        await StoreProduct.findByIdAndUpdate(item.productId?._id, {
          $inc: { stock: item.quantity },
        });
      }
    }
  }

  return updatedPayment;
};

/* -------------------------------------------------------------------------- */
/*                     Admin review queue: resolve actions                    */
/* -------------------------------------------------------------------------- */

/**
 * Runs `work` while holding an exclusive lock on a payment in "review".
 * `work` must return the final `{ status, extra }` to persist. On error the
 * lock is released and the payment stays in "review" so it can be retried.
 */
const withReviewLock = async (paymentId, adminId, action, note, work) => {
  const claimed = await Payment.findOneAndUpdate(
    {
      _id: paymentId,
      status: "review",
      "resolution.inProgress": { $ne: true },
    },
    { $set: { "resolution.inProgress": true } },
    { returnDocument: "after" },
  ).populate("memberId");

  if (!claimed) {
    const exists = await Payment.exists({ _id: paymentId });
    if (!exists) throw new ApiError(404, "Payment not found");
    throw new ApiError(
      409,
      "This payment is not in review or is already being resolved",
    );
  }

  try {
    const finalStatus = await work(claimed);

    const resolved = await Payment.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          status: finalStatus,
          "resolution.action": action,
          "resolution.resolvedBy": adminId,
          "resolution.resolvedAt": new Date(),
          "resolution.note": note || "",
          "resolution.inProgress": false,
        },
      },
      { returnDocument: "after" },
    ).populate("memberId", "fullName email");

    console.log(
      `[PAYMENT REVIEW] Payment ${paymentId} resolved as "${action}" by admin ${adminId}`,
    );
    return resolved;
  } catch (error) {
    await Payment.findByIdAndUpdate(paymentId, {
      $set: { "resolution.inProgress": false },
    });
    throw error;
  }
};

const approveReviewedPayment = (paymentId, adminId, note) =>
  withReviewLock(paymentId, adminId, "approve", note, async (payment) => {
    if (payment.type === "StoreOrder") {
      const order = await Order.findOne({
        _id: payment.paymentCauseId,
        memberId: payment.memberId._id,
      }).select("paymentStatus");

      if (!order) {
        throw new ApiError(
          409,
          "The order for this payment no longer exists or does not belong to the payer. Refund instead.",
        );
      }
      if (order.paymentStatus !== "pending") {
        throw new ApiError(
          409,
          `The order is no longer awaiting payment (status: ${order.paymentStatus}). Refund instead.`,
        );
      }
    }

    // Persist "successful" before fulfilment, mirroring the automatic flow.
    await Payment.findByIdAndUpdate(payment._id, {
      $set: { status: "successful" },
    });
    payment.status = "successful";

    await fulfilPayment(payment);

    if (payment.membershipPaymentType) {
      await Payment.findByIdAndUpdate(payment._id, {
        $set: { membershipPaymentType: payment.membershipPaymentType },
      });
    }

    return "successful";
  });

const refundReviewedPayment = (paymentId, adminId, note) =>
  withReviewLock(paymentId, adminId, "refund", note, async (payment) => {
    let charged;
    try {
      charged = await fetchSafepayChargedAmount(payment.trackerToken);
    } catch (error) {
      throw new ApiError(
        502,
        `Could not reach SafePay to determine the charged amount: ${error?.message}`,
      );
    }

    if (!charged || !(charged.amount > 0)) {
      throw new ApiError(
        409,
        "SafePay did not report a charged amount for this payment. If nothing was charged, use Reject instead.",
      );
    }

    try {
      await safepay.orders.payments.refund({
        tracker: payment.trackerToken,
        payload: { currency: charged.currency || "PKR", amount: charged.amount },
      });
    } catch (error) {
      throw new ApiError(
        502,
        `SafePay refund failed: ${error?.response?.data?.message || error?.message}`,
      );
    }

    await cleanupUnfulfilledPayment(payment, "refunded");
    return "refunded";
  });

const rejectReviewedPayment = (paymentId, adminId, note) =>
  withReviewLock(paymentId, adminId, "reject", note, async (payment) => {
    await cleanupUnfulfilledPayment(payment, "failed");
    return "failed";
  });

export {
  handleSuccessfulPayment,
  handleFailedPayment,
  handleRefundedPayment,
  approveReviewedPayment,
  refundReviewedPayment,
  rejectReviewedPayment,
};
