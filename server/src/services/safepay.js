import Safepay from "@sfpy/node-core";

const safepay = Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: "secret",
  host:
    process.env.SAFEPAY_HOST || "https://sandbox.api.getsafepay.com",
});

async function createPaymentSession(amount, paymentCauseId) {
  try {
    return await safepay.payments.session.setup({
      merchant_api_key: process.env.SAFEPAY_PUBLIC_KEY,
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: "PKR",
      amount: Math.round(Number(amount) * 100),
      metadata: { order_id: paymentCauseId },
      include_fees: false,
    });
  } catch (error) {
    console.error("Could not create Safepay payment session:", error.message);
    throw error;
  }
}

async function createAuthenticationToken() {
  try {
    return await safepay.client.passport.create();
  } catch (error) {
    console.error(
      "Could not create Safepay authentication token:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

function getCheckoutUrl(trackerToken, tbt) {
  return safepay.checkout.createCheckoutUrl({
    env: process.env.SAFEPAY_ENV || "sandbox",
    tracker: trackerToken,
    tbt,
    source: "hosted",
    redirect_url: `${process.env.CLIENT_URL}/payment/success`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
  });
}

/**
 * Fetches the amount SafePay actually recorded for a tracker, in the smallest
 * currency unit (paisa), straight from the Reporter API (source of truth).
 * Returns { amount, currency } or null if it cannot be determined.
 */
async function fetchSafepayChargedAmount(trackerToken) {
  const response = await safepay.reporter.payments.fetch(trackerToken);
  const data = response?.data;
  const quote =
    data?.purchase_totals?.quote_amount ||
    data?.tracker?.purchase_totals?.quote_amount;

  const amount = Number(quote?.amount);
  if (!Number.isFinite(amount)) return null;

  return { amount, currency: quote?.currency || null };
}

/**
 * Issues a refund on SafePay for `trackerToken`.
 * `amountInPaisa` must be an integer in the smallest currency unit.
 */
async function refundSafepayPayment(
  trackerToken,
  amountInPaisa,
  currency = "PKR",
) {
  return safepay.orders.payments.refund({
    tracker: trackerToken,
    payload: {
      currency,
      amount: Math.round(Number(amountInPaisa)),
    },
  });
}

export {
  safepay,
  createPaymentSession,
  createAuthenticationToken,
  getCheckoutUrl,
  fetchSafepayChargedAmount,
  refundSafepayPayment,
};
