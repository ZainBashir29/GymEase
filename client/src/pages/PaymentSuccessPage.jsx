import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import api from "../lib/axios.js";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const trackerToken = searchParams.get("tracker");
  const [state, setState] = useState("verifying");
  const [message, setMessage] = useState("Confirming your payment...");

  useEffect(() => {
    if (!trackerToken) {
      setState("error");
      setMessage("Safepay did not return a payment tracker.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data } = await api.post(
          `/payments/verify/${encodeURIComponent(trackerToken)}`,
        );
        setState("success");
        setMessage(data.message || "Payment confirmed. Your membership is active.");
      } catch (error) {
        setState("error");
        setMessage(
          error.response?.data?.message ||
            "We could not verify your payment. Please contact support.",
        );
      }
    };

    verifyPayment();
  }, [trackerToken]);

  const success = state === "success";

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl items-center px-6 py-16 text-center">
      <div className="w-full rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        {state === "verifying" ? (
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-600" />
        ) : success ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
        )}
        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          {state === "verifying"
            ? "Verifying payment"
            : success
              ? "Payment successful"
              : "Payment verification failed"}
        </h1>
        <p className="mt-3 text-slate-600">{message}</p>
        {state !== "verifying" && (
          <Link
            to={success ? "/member/dashboard" : "/pricing"}
            className="mt-7 inline-flex rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
          >
            {success ? "Go to dashboard" : "Back to pricing"}
          </Link>
        )}
      </div>
    </section>
  );
};

export default PaymentSuccessPage;
