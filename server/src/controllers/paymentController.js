import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createPaymentSession,
  createAuthenticationToken,
  getCheckoutUrl,
} from "../services/safepay.js";
import Payment from "../models/paymentModel.js";
import MembershipPlan from "../models/membershipPlanModel.js";
import Safepay from "@sfpy/node-core";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import {
  handleSuccessfulPayment,
  handleFailedPayment,
  handleRefundedPayment,
} from "../services/paymentOutcomeHandlers.js";
import mongoose from "mongoose";

const safepay = Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: "secret",
  host: "https://sandbox.api.getsafepay.com",
});

const createCheckoutUrl = asyncHandler(async (req, res) => {
  const { type, paymentCauseId, amount } = req.body;

  if (!type) {
    throw new ApiError(400, "Payment type is required");
  }

  if (!["MembershipSubscription", "StoreOrder"].includes(type)) {
    throw new ApiError(400, "Invalid payment type");
  }

  if (!paymentCauseId) {
    throw new ApiError(400, "Id of cause of payment is required");
  }

  if (type === "StoreOrder" && !amount) {
    throw new ApiError(400, "Payment amount is required");
  }

  let chargeAmount = Number(amount);

  if (type === "StoreOrder" && chargeAmount <= 0) {
    throw new ApiError(400, "Invalid payment amount");
  }

  if (type === "MembershipSubscription") {
    const membershipPlan = await MembershipPlan.findById(paymentCauseId);

    if (!membershipPlan || !membershipPlan.isActive) {
      throw new ApiError(404, "Invalid or inactive membership plan");
    }

    chargeAmount = membershipPlan.price;
  }

  const session = await createPaymentSession(
    chargeAmount,
    String(paymentCauseId),
  );

  if (!session) {
    throw new ApiError(500, "Could not create payment session");
  }

  const trackerToken = session.data?.tracker?.token;

  const authToken = await createAuthenticationToken();

  if (!authToken?.data) {
    throw new ApiError(
      500,
      "Could not create authentication token for payment",
    );
  }

  const tbt = authToken.data;

  const checkoutUrl = await getCheckoutUrl(trackerToken, tbt);

  if (!checkoutUrl) {
    throw new ApiError(500, "Could not create checkout url");
  }

  const pendingPaymentRecord = await Payment.create({
    memberId: req.user?._id,
    type,
    paymentCauseId,
    amount: chargeAmount,
    status: "pending",
    trackerToken,
  });

  if (!pendingPaymentRecord) {
    throw new ApiError(500, "Could not create payment record in db");
  }

  res.status(201).json(
    new ApiResponse(
      201,
      {
        paymentRecord: pendingPaymentRecord,
        checkoutUrl,
      },
      "Checkout url created successfully",
    ),
  );
});

const verifyPaymentStatus = asyncHandler(async (req, res) => {
  const { tracker } = req.params;

  if (!tracker) {
    throw new ApiError(400, "Tracker token is required");
  }

  const paymentRecord = await Payment.findOne({
    trackerToken: tracker,
    memberId: req.user?._id,
  });

  if (!paymentRecord) {
    throw new ApiError(404, "Payment record not found");
  }

  const response = await safepay.reporter.payments.fetch(tracker);

  if (!response) {
    throw new ApiError(500, "Could not fetch payment status");
  }

  const status = response.data?.state;

  if (status !== "TRACKER_ENDED") {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          paymentRecord,
          `Payment is not complete yet. Current state: ${status}`,
        ),
      );
  }

  const updatedPaymentStatus = await handleSuccessfulPayment(tracker);

  if (!updatedPaymentStatus) {
    throw new ApiError(500, "Could not process successful payment");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPaymentStatus,
        "Payment is processed successfully",
      ),
    );
});

const verifyWebhookSignature = asyncHandler(async (req, res) => {
  const signature = req.get("X-SFPY-SIGNATURE");

  if (!signature) {
    throw new ApiError(400, "Signature is required");
  }

  const event = await safepay.webhooks.constructEvent(
    req.body,
    signature,
    process.env.SAFEPAY_WEBHOOK_SECRET,
  );

  if (!event) {
    throw new ApiError(400, "Webhook signature verification failed");
  }

  // switch (event.type) {
  //   case "payment.succeeded": {
  //     const { tracker } = event.data;

  //     if (!tracker?.token) {
  //       throw new ApiError(500, "Could not find tracker token in webhook data");
  //     }

  //     const updatedPayment = await Payment.findOneAndUpdate(
  //       {
  //         trackerToken: tracker.token,
  //       },
  //       {
  //         $set: {
  //           status: "successful",
  //         },
  //       },
  //       {
  //         returnDocument: "after",
  //       },
  //     );

  //     if (!updatedPayment) {
  //       console.error("Could not update payment status to successful in db");
  //       break;
  //     }

  //     if (updatedPayment.type === "MembershipSubscription") {
  //       const updatedMembershipStatus =
  //         await MembershipSubscription.findOneAndUpdate(
  //           {
  //             membershipPlanId: updatedPayment.paymentCauseId,
  //             memberId: updatedPayment.memberId,
  //           },
  //           {
  //             $set: {
  //               status: "active",
  //               paymentId: updatedPayment._id,
  //             },
  //           },
  //           {
  //             returnDocument: "after",
  //           },
  //         );

  //       if (!updatedMembershipStatus) {
  //         throw new ApiError(
  //           500,
  //           "Could not update membership subscription status in db",
  //         );
  //       }
  //     }

  //     if (updatedPayment?.type === "StoreOrder") {
  //       const updatedStoreOrderStatus = await StoreOrder.findOneAndUpdate(
  //         {
  //           _id: updatedPayment.paymentCauseId,
  //           memberId: updatedPayment.memberId,
  //         },
  //         {
  //           $set: {
  //             paymentStatus: "paid",
  //             status: "processing",
  //             paymentId: updatedPayment._id,
  //           },
  //         },
  //         {
  //           returnDocument: "after",
  //         },
  //       );

  //       if (!updatedStoreOrderStatus) {
  //         throw new ApiError(500, "Could not update store order status in db");
  //       }
  //     }

  //     break;
  //   }
  //   case "payment.failed": {
  //     const { tracker } = event.data;

  //     if (!tracker?.token) {
  //       throw new ApiError(500, "Could not find tracker token in webhook data");
  //     }

  //     const updatedPaymentStatus = await Payment.findOneAndUpdate(
  //       {
  //         trackerToken: tracker.token,
  //       },
  //       {
  //         $set: {
  //           status: "failed",
  //         },
  //       },
  //       {
  //         returnDocument: "after",
  //       },
  //     );

  //     if (!updatedPaymentStatus) {
  //       console.error("Could not update failed payment status in db");
  //       break;
  //     }

  //     break;
  //   }

  //   default:
  //     console.log("Received unknown event type " + event.type);
  // }

  switch (event.type) {
    case "payment.succeeded": {
      const { tracker } = event.data;

      if (!tracker?.token) {
        throw new ApiError(500, "Could not find tracker token in webhook data");
      }

      const updatedPayment = await handleSuccessfulPayment(tracker.token);

      if (!updatedPayment) {
        console.error("Could not process successful payment from webhook");
      }

      break;
    }

    case "payment.failed": {
      const { tracker } = event.data;

      if (!tracker?.token) {
        throw new ApiError(500, "Could not find tracker token in webhook data");
      }

      await handleFailedPayment(tracker.token);
      break;
    }

    default:
      console.log("Received unknown event type " + event.type);
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Webhook received successfully"));
});

const refundPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  if (!paymentId || !mongoose.isValidObjectId(paymentId)) {
    throw new ApiError(400, "Payment ID is required");
  }

  const paymentRecord = await Payment.findOne({
    _id: paymentId,
    memberId: req.user?._id,
  });

  if (!paymentRecord) {
    throw new ApiError(404, "Payment record not found");
  }

  if (paymentRecord?.status !== "successful") {
    throw new ApiError(400, "Only successful payments can be refunded");
  }

  const refundPayment = await safepay.orders.payments.refund({
    tracker: paymentRecord?.trackerToken,
    payload: {
      currency: "PKR",
      amount: paymentRecord?.amount * 100,
    },
  });

  if (!refundPayment) {
    throw new ApiError(500, "Could not refund payment");
  }

  const updatedPayment = await handleRefundedPayment(paymentId);

  if (!updatedPayment) {
    throw new ApiError(
      500,
      "Could not update payment status to refunded in db",
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedPayment, "Payment refunded successfully"),
    );
});

export {
  createCheckoutUrl,
  verifyPaymentStatus,
  verifyWebhookSignature,
  refundPayment,
};
