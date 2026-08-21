import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
const PaymentFailurePage = () => {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl items-center px-6 py-16 text-center">
      <div className="w-full rounded-2xl bg-white p-8 shadow-lg ring-1 ring-slate-200">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Payment Failed
        </h1>
        <p className="mt-3 text-slate-600">
          We couldn't process your payment. You might have cancelled the
          transaction, or your payment provider declined it. Please try again or
          contact support if the issue persists.
        </p>
        <Link
          to="/pricing"
          className="mt-7 inline-flex rounded-md bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700"
        >
          Back to pricing
        </Link>
      </div>
    </section>
  );
};
export default PaymentFailurePage;
