import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios.js";
import {
  ArrowLeft,
  Dumbbell,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ConfirmModal from "../../components/Dashboard/ConfirmModal.jsx";

const GymPlanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [planRes, activePlanRes] = await Promise.all([
          api.get(`/gym-plans/${id}`),
          api.get("/gym-plans/active").catch(() => ({ data: { data: null } })),
        ]);
        setPlan(planRes.data.data);
        setActivePlan(activePlanRes.data.data);
      } catch (error) {
        console.error("Failed to fetch plan details:", error);
        setError("Could not load plan details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleActivate = async () => {
    if (activePlan) {
      setError("You already have an active gym plan.");
      return;
    }

    setActivating(true);
    setError("");
    try {
      await api.post(`/gym-plans/activate/${id}`);
      navigate("/member/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to activate plan. Make sure you have an active membership.",
      );
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Plan Not Found
        </h2>
        <Link
          to="/member/plans"
          className="text-brand-600 font-medium hover:underline"
        >
          &larr; Back to Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        to="/member/plans"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Plans
      </Link>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {activePlan && !error && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl flex items-start gap-3 text-yellow-800">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">You currently have an active plan.</p>
            <p className="text-sm mt-1">
              You cannot activate a new plan until your current one is finished
              or cancelled.
            </p>
          </div>
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className="shrink-0 px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-lg hover:bg-yellow-200 transition-colors"
          >
            Cancel Active Plan
          </button>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="bg-brand-50 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-8 border-b border-slate-100">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
            <Dumbbell className="w-12 h-12 text-brand-500" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
              {plan.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                <Clock className="w-4 h-4 text-brand-500" />
                {plan.duration} Days
              </span>
              <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                <Dumbbell className="w-4 h-4 text-brand-500" />
                {plan.sessions?.length || 0} Sessions
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              About this plan
            </h3>
            <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
              {plan.description}
            </p>
            {plan.details && (
              <p className="text-slate-500 mt-4 leading-relaxed">
                {plan.details}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              What you'll be doing
            </h3>
            <div className="space-y-4">
              {plan.sessions?.map((session, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg mb-2">
                      {session.name}
                    </h4>
                    <ul className="space-y-1">
                      {session.exercises?.map((ex, eIdx) => (
                        <li
                          key={eIdx}
                          className="text-sm text-slate-600 flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-brand-400" />
                          <span className="font-medium text-slate-700">
                            {ex.name}
                          </span>
                          <span className="text-slate-400">&mdash;</span>
                          <span>
                            {ex.duration
                              ? ex.duration
                              : `${ex.sets} sets Ã— ${ex.reps} reps`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleActivate}
              disabled={activating || activePlan !== null}
              className="w-full md:w-auto px-8 py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              {activating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Activating...
                </>
              ) : (
                "Activate This Plan"
              )}
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => !isCancelling && setIsCancelModalOpen(false)}
        onConfirm={async () => {
          setIsCancelling(true);
          try {
            await api.post(`/gym-plans/cancel/${activePlan?._id}`);
            setActivePlan(null);
            setIsCancelModalOpen(false);
          } catch (error) {
            alert(error.response?.data?.message || "Failed to cancel plan");
          } finally {
            setIsCancelling(false);
          }
        }}
        title="Cancel Active Plan?"
        message="Are you sure you want to cancel your current gym plan? All your scheduled sessions will be permanently removed. This action cannot be undone."
        confirmText="Cancel Plan"
        cancelText="Keep Plan"
        isDanger={true}
        isLoading={isCancelling}
      />
    </div>
  );
};

export default GymPlanDetailsPage;
