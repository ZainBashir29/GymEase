import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/axios.js";
import {
  Dumbbell,
  Clock,
  ChevronRight,
  Wand2,
  LayoutDashboard,
  CreditCard,
  ShoppingBag,
  Package,
  Settings,
} from "lucide-react";
import ConfirmModal from "../../components/Dashboard/ConfirmModal.jsx";
import { useChat } from "../../context/ChatContext.jsx";

const memberSidebarItems = [
  { label: "Dashboard", to: "/member/dashboard", icon: LayoutDashboard },
  { label: "Gym Plans", to: "/member/plans", icon: Dumbbell },
  { label: "Membership", to: "/member/membership", icon: CreditCard },
  { label: "Store", to: "/store", icon: ShoppingBag },
  { label: "Orders", to: "/member/orders", icon: Package },
  { label: "Settings", to: "/member/settings", icon: Settings },
];

const GymPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();
  const { fetchConversations } = useChat();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, activePlanRes, membershipRes] = await Promise.all([
        api.get("/gym-plans").catch(() => ({ data: { data: [] } })),
        api
          .get(`/gym-plans/active?_t=${Date.now()}`)
          .catch(() => ({ data: { data: null } })),
        api
          .get(`/memberships/current?_t=${Date.now()}`)
          .catch(() => ({ data: { data: null } })),
      ]);

      const activePlansOnly = (plansRes.data?.data || []).filter(
        (p) => p.isActive !== false,
      );
      setPlans(activePlansOnly);
      setActivePlan(activePlanRes.data?.data || null);
      setMembership(membershipRes.data?.data || null);
    } catch (error) {
      console.error("Failed to fetch gym plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gym Plans</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose from our expertly crafted popular plans or let our AI generate
          a custom plan just for you.
        </p>
      </div>

      {activePlan && (
        <div className="mb-12 rounded-2xl bg-brand-50 p-6 border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-4 dark:bg-brand-900/20 dark:border-brand-900/30">
          <div>
            <h2 className="text-lg font-bold text-brand-900 flex items-center gap-2 dark:text-brand-100">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
              </span>
              You have an active plan
            </h2>
            <p className="text-brand-700 mt-1 dark:text-brand-300">
              You must complete or cancel your current plan before activating a
              new one.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
            <button
              onClick={() => setIsCancelModalOpen(true)}
              className="w-full sm:w-auto shrink-0 px-6 py-2 bg-white text-red-600 font-medium rounded-lg hover:bg-red-50 border border-red-200 transition-colors dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-900/20 dark:border-red-900/50"
            >
              Cancel Plan
            </button>
            <Link
              to="/member/dashboard"
              className="w-full sm:w-auto text-center shrink-0 px-6 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}

      <div className="mb-12 overflow-hidden rounded-3xl bg-slate-900 text-white relative shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/20 to-purple-600/20 mix-blend-overlay"></div>
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-black mb-4 flex items-center justify-center md:justify-start gap-3">
              <Wand2 className="w-8 h-8 text-brand-400" />
              Build a Custom Plan
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mb-8">
              Answer a few quick questions about your fitness goals, experience
              level, and availability, and we'll instantly generate a
              personalized multi-week workout plan tailored entirely to you.
            </p>
            {membership?.membershipPlanId?.name === "Basic" ? (
              <div className="flex flex-col items-center md:items-start gap-2">
                <button
                  disabled
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-700 text-slate-300 font-bold rounded-xl cursor-not-allowed"
                >
                  Start Questionnaire
                  <ChevronRight className="w-5 h-5" />
                </button>
                <p className="text-sm text-brand-300 font-medium">
                  Upgrade to Standard or Premium to unlock Custom Plans
                </p>
              </div>
            ) : (
              <button
                onClick={() => navigate("/member/plans/custom/questionnaire")}
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all hover:scale-105"
              >
                Start Questionnaire
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="hidden md:block w-48 h-48 rounded-full border-8 border-slate-800 bg-slate-800 relative shadow-2xl overflow-hidden shrink-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <Dumbbell className="w-24 h-24 text-brand-500" strokeWidth={1} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Popular Plans</h2>
        <p className="text-slate-500 mt-1 dark:text-slate-400">
          Ready-to-go routines crafted by our elite trainers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
            <p className="text-slate-500 dark:text-slate-400">
              No popular plans available right now.
            </p>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 flex flex-col group hover:shadow-md transition-all hover:ring-brand-200 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-brand-900/50"
            >
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center mb-6 dark:bg-brand-900/20 dark:text-brand-400">
                <Dumbbell className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 dark:text-white">
                {plan.name}
              </h3>
              <p className="text-slate-500 text-sm mb-6 line-clamp-3 flex-1 dark:text-slate-400">
                {plan.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg dark:text-slate-300 dark:bg-slate-800">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-brand-500" />
                  {plan.duration} Days
                </div>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                <div className="font-medium">
                  {plan.sessions?.length || 0} Sessions
                </div>
              </div>

              <Link
                to={`/member/plans/${plan._id}`}
                className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors group-hover:border-brand-300 group-hover:text-brand-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:group-hover:border-brand-500 dark:group-hover:text-brand-400"
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))
        )}
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
            fetchConversations();
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
    </>
  );
};

export default GymPlansPage;
