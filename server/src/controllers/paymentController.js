import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createPaymentSession,
  createAuthenticationToken,
  getCheckoutUrl,
} from "../services/safepay.js";
import Payment from "../models/paymentModel.js";

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

  const session = await createPaymentSession(amount, type, paymentCauseId);

  if (!session) {
    throw new ApiError(500, "Could not create payment session");
  }

  const trackerToken = session.data.tracker.token;

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
