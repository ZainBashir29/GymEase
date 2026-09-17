import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import api from "../lib/axios.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Memberships = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchasingPlanId, setPurchasingPlanId] = useState(null);
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get("/memberships/plans");
        const activePlans = response.data.data.filter((plan) => plan.isActive);
        setPlans(activePlans);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load membership plans.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleGetStarted = async (planId) => {
    if (!user) {
      navigate("/register", { state: { redirectTo: "/pricing" } });
      return;
    }

    setError("");
    setPurchasingPlanId(planId);

    try {
      await api.post("/memberships/create", { membershipPlanId: planId });

      const { data } = await api.post("/payments/initiate", {
        type: "MembershipSubscription",
        paymentCauseId: String(planId),
        amount: plans.find((p) => p._id === planId)?.price,
      });

      window.location.href = data.data.checkoutUrl;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't start checkout. Please try again.",
      );
      setPurchasingPlanId(null);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Choose the right plan for you
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Whether you're just getting started or are already an athlete, we
            have a membership plan that fits your goals.
          </p>
        </div>
        {loading ? (
          <div className="mt-16 flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          </div>
        ) : error ? (
          <div className="mt-16 text-center text-red-500 bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="font-medium">{error}</p>
          </div>
        ) : (
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 xl:gap-x-12">
            {plans.map((plan, planIdx) => (
              <div
                key={plan._id}
                className={`rounded-3xl p-8 ring-1 sm:p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col ${
                  planIdx === 1
                    ? "bg-brand-900 ring-brand-900 text-white shadow-2xl scale-105 z-10"
                    : "bg-white ring-slate-200 shadow-md hover:ring-brand-200"
                }`}
              >
                <h3
                  id={plan._id}
                  className={`text-lg font-semibold leading-8 ${
                    planIdx === 1 ? "text-white" : "text-brand-600"
                  }`}
                >
                  {plan.name}
                </h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span
                    className={`text-5xl font-bold tracking-tight ${
                      planIdx === 1 ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Rs. {plan.price.toLocaleString()}
                  </span>
                  <span
                    className={`text-base ${
                      planIdx === 1 ? "text-brand-200" : "text-slate-500"
                    }`}
                  >
                    / {plan.duration} days
                  </span>
                </p>
                <p
                  className={`mt-6 text-sm leading-6 ${
                    planIdx === 1 ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Includes access to gym equipment and up to {plan.maxTrainers}{" "}
                  personal trainer/s.
                </p>
                <ul
                  role="list"
                  className={`mt-8 space-y-3 text-sm leading-6 sm:mt-10 flex-1 ${
                    planIdx === 1 ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {plan.details.map((detail, index) => (
                    <li key={index} className="flex gap-x-3 items-center">
                      <div
                        className={`flex h-6 w-6 flex-none items-center justify-center rounded-full ${
                          planIdx === 1 ? "bg-brand-500/20" : "bg-brand-50"
                        }`}
                      >
                        <Check
                          className={`h-4 w-4 ${
                            planIdx === 1 ? "text-brand-300" : "text-brand-600"
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      {detail}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleGetStarted(plan._id)}
                  disabled={purchasingPlanId === plan._id}
                  aria-describedby={plan._id}
                  className={`mt-8 flex w-full items-center justify-center gap-2 rounded-md px-3 py-3 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-offset-2 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                    planIdx === 1
                      ? "bg-brand-500 text-white hover:bg-brand-400 focus-visible:outline-brand-500"
                      : "bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-600"
                  }`}
                >
                  {purchasingPlanId === plan._id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {purchasingPlanId === plan._id
                    ? "Redirecting..."
                    : "Get started"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Memberships;
