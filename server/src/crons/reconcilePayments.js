import Safepay from "@sfpy/node-core";
import Payment from "../models/paymentModel.js";
import {
  handleSuccessfulPayment,
  handleFailedPayment,
} from "../services/paymentOutcomeHandlers.js";

const safepay = Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: "secret",
  host: "https://sandbox.api.getsafepay.com",
});

const minutes = 30;

const reconcilePayments = async () => {
  const timeToReconcile = new Date(Date.now() - minutes * 60 * 1000);

  const stalePayments = await Payment.find({
    status: "pending",
    createdAt: { $lt: timeToReconcile },
  });

  if (stalePayments.length == 0) {
    console.log("No payments to reconcile");
    return;
  }

  for (const payment of stalePayments) {
    try {
      const response = await safepay.reporter.payments.fetch(
        payment.trackerToken,
      );

      const state = response?.data?.tracker?.state;

      if (state === "TRACKER_ENDED") {
        await handleSuccessfulPayment(payment.trackerToken);
        console.log(`Reconciled payment ${payment._id} as successful`);
      } else if (state === "TRACKER_CANCELLED" || state === "TRACKER_EXPIRED") {
        await handleFailedPayment(payment.trackerToken);
        console.log(`Reconciled payment ${payment._id} as failed`);
      } else {
        console.log(`Payment ${payment._id} still pending, state: ${state}`);
      }
    } catch (error) {
      console.error(
        `Failed to reconcile payment ${payment._id}`,
        error.message,
      );
    }
  }
};

export default reconcilePayments;
