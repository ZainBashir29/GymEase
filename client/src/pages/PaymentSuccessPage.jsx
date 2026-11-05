import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Loader2,
  XCircle,
  ShoppingBag,
  Dumbbell,
  Clock,
} from "lucide-react";
import api from "../lib/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const getMembershipSuccessMessage = (membershipPaymentType) => {
  switch (membershipPaymentType) {
    case "renewal":
      return "Your membership renewal has been confirmed. Your access has been extended and your plan remains active.";
    case "plan_change":
      return "Your membership plan change has been confirmed. Your updated plan is now active.";
    case "returning_member":
      return "Welcome back! Your membership has been reactivated successfully, and your GymEase access is ready again.";
    case "new_membership":
    default:
      return "Payment confirmed! Your membership is now active. Welcome to GymEase!";
  }
};

const getMembershipSuccessTitle = (membershipPaymentType) => {
  switch (membershipPaymentType) {
    case "renewal":
      return "Membership Renewal Successful!";
    case "plan_change":
      return "Plan Change Successful!";
    case "returning_member":
      return "Welcome Back!";
    case "new_membership":
    default:
      return "Membership Activated!";
  }
};

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const trackerToken = searchParams.get("tracker");
  const [state, setState] = useState("verifying");
  const [message, setMessage] = useState("Confirming your payment...");
  const [paymentType, setPaymentType] = useState(null);
  const [membershipPaymentType, setMembershipPaymentType] = useState(null);
  const { clearLocalCart, refreshMembershipAndCart } = useCart();
  const { isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!trackerToken) {
      setState("error");
      setMessage("Safepay did not return a valid payment tracker.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data } = await api.post(
          `/payments/verify/${encodeURIComponent(trackerToken)}`,
        );
        const paymentType = data.data?.type;

        // Payment received but held for admin review: do not treat as success.
        if (data.data?.status === "review") {
          setPaymentType(paymentType);
          setState("review");
          setMessage(
            "We received your payment, but it needs a quick manual check before we can confirm it. Our team will review it shortly; if anything is wrong, you will be refunded. No action is needed from you.",
          );
          return;
        }

        setState("success");

        const resolvedMembershipType =
          data.data?.membershipPaymentType ||
          data.data?.paymentRecord?.membershipPaymentType;

        setPaymentType(paymentType);
        setMembershipPaymentType(resolvedMembershipType);

        if (paymentType === "StoreOrder") {
          setMessage(
            "Thank you for your purchase! Your payment has been confirmed and your store order is now being processed.",
          );
          await clearLocalCart?.();
        } else if (paymentType === "MembershipSubscription") {
          setMessage(getMembershipSuccessMessage(resolvedMembershipType));
          await refreshMembershipAndCart?.(true);
        } else {
          setMessage(data.message || "Payment processed successfully.");
        }
      } catch (error) {
        setState("error");
        setMessage(
          error.response?.data?.message ||
            "We could not verify your payment. Please contact support or check your dashboard.",
        );
      }
    };

    verifyPayment();
  }, [trackerToken, isAuthLoading]);

  const isSuccess = state === "success";
  const isReview = state === "review";

  return (
    <section className="mx-auto flex min-h-[65vh] max-w-xl items-center px-6 py-16 text-center">
      <div className="w-full rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        {state === "verifying" ? (
          <Loader2 className="mx-auto h-14 w-14 animate-spin text-brand-600 dark:text-brand-400" />
        ) : isReview ? (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
        ) : isSuccess ? (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
        ) : (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
            <XCircle className="h-10 w-10 text-danger" />
          </div>
        )}

        <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
          {state === "verifying"
            ? "Verifying payment..."
            : isReview
              ? "Payment Under Review"
              : isSuccess
              ? paymentType === "StoreOrder"
                ? "Order Placed Successfully!"
                : getMembershipSuccessTitle(membershipPaymentType)
              : "Payment Verification Failed"}
        </h1>

        <p className="mt-3 text-slate-600 leading-relaxed dark:text-slate-400">{message}</p>

        {state !== "verifying" && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isReview ? (
              <>
                <Link
                  to="/member/dashboard"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/"
                  className="flex w-full sm:w-auto items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Return Home
                </Link>
              </>
            ) : isSuccess ? (
              paymentType === "StoreOrder" ? (
                <>
                  <Link
                    to="/store"
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ShoppingBag className="h-4 w-4 text-brand-600" />
                    Continue Shopping
                  </Link>
                  <Link
                    to="/member/dashboard"
                    state={{ newOrder: true }}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
                  >
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <Link
                  to="/member/dashboard"
                  state={{
                    fromPayment: true,
                    ...(paymentType === "StoreOrder" ? { newOrder: true } : {}),
                  }}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
                >
                  <Dumbbell className="h-4 w-4" />
                  Go to Member Dashboard
                </Link>
              )
            ) : (
              <>
                <Link
                  to="/pricing"
                  className="flex w-full sm:w-auto items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
                >
                  Back to Pricing
                </Link>
                <Link
                  to="/"
                  className="flex w-full sm:w-auto items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Return Home
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PaymentSuccessPage;
