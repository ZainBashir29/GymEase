import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { XCircle, Loader2 } from "lucide-react";
import api from "../lib/axios.js";

const getMembershipFailureMessage = (membershipPaymentType) => {
  switch (membershipPaymentType) {
    case "renewal":
      return "Your membership renewal could not be completed. Your current plan is still active, and you can retry the renewal whenever you are ready.";
    case "plan_change":
      return "Your plan change was not completed. Your current membership remains active, so you can try again or choose another plan.";
    case "returning_member":
      return "We couldn't reactivate your membership this time. Your previous membership status remains unchanged, and you can retry your return anytime.";
    case "new_membership":
    default:
      return "We couldn't activate your new membership. Please review your payment details and try again.";
  }
};

const getMembershipFailureTitle = (membershipPaymentType) => {
  switch (membershipPaymentType) {
    case "renewal":
      return "Membership Renewal Failed";
    case "plan_change":
      return "Plan Change Failed";
    case "returning_member":
      return "Reactivation Failed";
    case "new_membership":
    default:
      return "Membership Payment Failed";
  }
};

const PaymentFailurePage = () => {
  const [searchParams] = useSearchParams();
  const trackerToken = searchParams.get("tracker");
  const [loading, setLoading] = useState(Boolean(trackerToken));
  const [message, setMessage] = useState(
    "We couldn't process your payment. You might have cancelled the transaction, or your payment provider declined it. Please try again or contact support if the issue persists.",
  );
  const [title, setTitle] = useState("Payment Failed");

  useEffect(() => {
    if (!trackerToken) {
      setLoading(false);
      return;
    }

    const verifyFailure = async () => {
      try {
        const { data } = await api.post(
          `/payments/verify/${encodeURIComponent(trackerToken)}`,
        );

        const paymentType = data.data?.type;
        const membershipPaymentType =
          data.data?.membershipPaymentType ||
          data.data?.paymentRecord?.membershipPaymentType;

        if (paymentType === "MembershipSubscription") {
          setTitle(getMembershipFailureTitle(membershipPaymentType));
          setMessage(getMembershipFailureMessage(membershipPaymentType));
        }
      } catch (error) {
        setTitle("Payment Failed");
        setMessage(
          error.response?.data?.message ||
            "We couldn't process your payment. Please try again or contact support.",
        );
      } finally {
        setLoading(false);
      }
    };

    verifyFailure();
  }, [trackerToken]);

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl items-center px-6 py-16 text-center">
      <div className="w-full rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        {loading ? (
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-600" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
        )}
        <h1 className="mt-5 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-slate-600">{message}</p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/pricing"
            className="inline-flex rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
          >
            Back to pricing
          </Link>
          <Link
            to="/member/membership"
            className="inline-flex rounded-md border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Membership
          </Link>
        </div>
      </div>
    </section>
  );
};
export default PaymentFailurePage;
