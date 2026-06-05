import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createPaymentSession,
  createAuthenticationToken,
  getCheckoutUrl,
} from "../services/safepay.js";
import Payment from "../models/paymentModel.js";
import Safepay from "@sfpy/node-core";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";

const safepay = Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: "secret",
  host: "https://sandbox.api.getsafepay.com",
});

const createCheckoutUrl = asyncHandler(async (req, res) => {
  const { type, paymentCauseId, amount } = req.body;

  if (!type) {
    throw new ApiError(400, "Payment type is required");
  }

  if (!paymentCauseId) {
    throw new ApiError(400, "Id of cause of payment is required");
  }

  if (!amount) {
    throw new ApiError(400, "Payment amount is required");
  }

  if (Number(amount) <= 0) {
    throw new ApiError(400, "Invalid payment amount");
  }

  const session = await createPaymentSession(amount, type, paymentCauseId);

  if (!session) {
    throw new ApiError(500, "Could not create payment session");
  }

  const trackerToken = session.data?.tracker?.token;

  const authToken = await createAuthenticationToken();

  if (!authToken) {
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
    amount,
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
  const { trackerToken } = req.body;

  if (!trackerToken) {
    throw new ApiError(400, "Tracker token is required");
  }

  const response = await safepay.reporter.payments.fetch(trackerToken);

  if (!response) {
    throw new ApiError(500, "Could not fetch payment status");
  }

  const status = response.data?.tracker?.state;

  if (status !== "TRACKER_ENDED") {
    const paymentRecord = await Payment.findOne({ trackerToken });

    if (!paymentRecord) {
      throw new ApiError(404, "Payment record not found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          paymentRecord,
          `Payment is not complete yet. Current state: ${status}`,
        ),
      );
  }

  const updatedPaymentStatus = await Payment.findOneAndUpdate(
    {
      trackerToken,
    },
    {
      $set: {
        status: "successful",
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedPaymentStatus) {
    throw new ApiError(500, "Could not update payment status in db");
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

  switch (event.type) {
    case "payment.succeeded": {
      const { tracker } = event.data;

      if (!tracker?.token) {
        throw new ApiError(500, "Could not find tracker token in webhook data");
      }

      const updatedPayment = await Payment.findOneAndUpdate(
        {
          trackerToken: tracker.token,
        },
        {
          $set: {
            status: "successful",
          },
        },
        {
          returnDocument: "after",
        },
      );

      if (!updatedPayment) {
        console.error("Could not update payment status to successful in db");
        break;
      }

      if (updatedPayment.type === "MembershipSubscription") {
        const updatedMembershipStatus =
          await MembershipSubscription.findOneAndUpdate(
            {
              membershipPlanId: updatedPayment.paymentCauseId,
              memberId: updatedPayment.memberId,
            },
            {
              $set: {
                status: "active",
                paymentId: updatedPayment._id,
              },
            },
            {
              returnDocument: "after",
            },
          );

        if (!updatedMembershipStatus) {
          throw new ApiError(
            500,
            "Could not update membership subscription status in db",
          );
        }
      }

      if (updatedPayment?.type === "StoreOrder") {
        const updatedStoreOrderStatus = await StoreOrder.findOneAndUpdate(
          {
            _id: updatedPayment.paymentCauseId,
            memberId: updatedPayment.memberId,
          },
          {
            $set: {
              paymentStatus: "paid",
              status: "processing",
              paymentId: updatedPayment._id,
            },
          },
          {
            returnDocument: "after",
          },
        );

        if (!updatedStoreOrderStatus) {
          throw new ApiError(500, "Could not update store order status in db");
        }
      }

      break;
    }
    case "payment.failed": {
      const { tracker } = event.data;

      if (!tracker?.token) {
        throw new ApiError(500, "Could not find tracker token in webhook data");
      }

      const updatedPaymentStatus = await Payment.findOneAndUpdate(
        {
          trackerToken: tracker.token,
        },
        {
          $set: {
            status: "failed",
          },
        },
        {
          returnDocument: "after",
        },
      );

      if (!updatedPaymentStatus) {
        console.error("Could not update failed payment status in db");
        break;
      }

      break;
    }

    default:
      console.log("Received unknown event type " + event.type);
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Webhook received successfully"));
});

export { createCheckoutUrl, verifyPaymentStatus, verifyWebhookSignature };
