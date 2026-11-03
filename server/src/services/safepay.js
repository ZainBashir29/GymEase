import Safepay from "@sfpy/node-core";

const safepay = Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: "secret",
  host: "https://sandbox.api.getsafepay.com",
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
    env: "sandbox",
    tracker: trackerToken,
    tbt,
    source: "hosted",
    redirect_url: `${process.env.CLIENT_URL}/payment/success`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
  });
}

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

export {
  createPaymentSession,
  createAuthenticationToken,
  getCheckoutUrl,
  fetchSafepayChargedAmount,
};
