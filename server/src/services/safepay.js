import safepay, { Safepay } from "@sfpy/node-core";

const safepay = new Safepay(process.env.SAFEPAY_SECRET_KEY, {
  authType: "secret",
  host: "https://sandbox.api.getsafepay.com",
});

async function createPaymentSession(amount, type, paymentCauseId) {
  try {
    const response = await safepay.payments.session.setup({
      merchant_api_key: process.env.SAFEPAY_PUBLIC_KEY,
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: "USD",
      amount: amount * 100,
      metadata: {
        type,
        paymentCauseId,
      },
      include_fees: false,
    });

    return response;
  } catch (err) {
    console.log(error);
  }
}

async function createAuthenticationToken() {
  try {
    const response = await safepay.auth.passport.create();
    return response;
  } catch (err) {
    console.log(error);
  }
}

async function getCheckoutUrl(trackerToken, tbt) {
  try {
    const checkoutURL = await safepay.checkouts.payment.create({
      // this the tracker.token from the payment session response
      tracker: trackerToken,
      // the authentication token
      tbt: tbt,
      // either production or sandbox
      environment: "sandbox",
      // attach a source, available options are: hosted, popup, mobile, woocommerce, and shopify
      source: "hosted",
      // the success URL to redirect your customer to after payment complete
      redirect_url: "https://localhost:8000/api/v1/payments/success",
      // the cancel URL to redirect your customer to after the customer cancels the checkout session
      cancel_url: "https://localhost:8000/api/v1/payments/cancel",
    });
    return checkoutURL;
  } catch (err) {
    console.log(error);
  }
}

export { createPaymentSession, createAuthenticationToken, getCheckoutUrl };
