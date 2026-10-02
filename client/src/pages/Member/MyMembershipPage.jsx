import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/axios.js";
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings,
} from "lucide-react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";
import {
  LayoutDashboard,
  Dumbbell,
  ShoppingBag,
  MessageCircle,
  Package,
} from "lucide-react";

const memberNavbarItems = [
  {
    label: "Dashboard",
    to: "/member/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { label: "Gym Plans", to: "/member/plans", icon: Dumbbell },
  { label: "Membership", to: "/member/membership", icon: CreditCard },
  { label: "Store", to: "/store", icon: ShoppingBag },
  { label: "Orders", to: "/member/orders", icon: Package },
  { label: "Settings", to: "/member/settings", icon: Settings },
];

const MyMembershipPage = () => {
  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [currentRes, historyRes] = await Promise.allSettled([
          api.get(`/memberships/current`, {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }),
          api.get(`/memberships/history`, {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }),
        ]);
        if (currentRes.status === "fulfilled") {
          setSubscription(currentRes.value.data.data);
        } else if (currentRes.reason.response?.status !== 404) {
          setError("Failed to load membership details.");
        }
        if (historyRes.status === "fulfilled") {
          setHistory(historyRes.value.data.data);
        }
      } catch (err) {
        console.error("Error fetching membership data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancel = async () => {
    if (
      window.confirm(
        "Are you sure you want to cancel your membership? This action will take effect immediately.",
      )
    ) {
      try {
        await api.post("/memberships/cancel");
        setSubscription({ ...subscription, status: "cancelled" });
        alert("Membership cancelled successfully.");
      } catch (err) {
        alert("Failed to cancel membership.");
      }
    }
  };

  const handleRenew = async () => {
    if (!subscription || !subscription.membershipPlanId) return;
    try {
      setLoading(true);
      const planId = subscription.membershipPlanId._id;
      const price = subscription.membershipPlanId.price;
      
      await api.post("/memberships/create", { membershipPlanId: planId });

      const { data } = await api.post("/payments/initiate", {
        type: "MembershipSubscription",
        paymentCauseId: String(planId),
        amount: price,
      });

      window.location.href = data.data.checkoutUrl;
    } catch (err) {
      alert("Failed to initiate renewal checkout.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 dark:text-white">
          My Membership
        </h1>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        ) : !subscription ||
          subscription.status === "cancelled" ||
          subscription.status === "expired" ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4 dark:text-slate-600" />
            <h2 className="text-xl font-bold text-slate-900 mb-2 dark:text-white">
              No Active Membership
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto dark:text-slate-400">
              You currently do not have an active membership. Subscribe to a
              plan to unlock all GymEase features and gym access.
            </p>
            <Link
              to="/member/membership/plans"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
            >
              Browse Plans
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-brand-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-brand-900/50">
            <div className="bg-brand-50 p-6 border-b border-brand-100 flex items-start justify-between flex-wrap gap-4 dark:bg-brand-900/20 dark:border-brand-900/30">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-3 dark:bg-brand-900/50 dark:text-brand-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                  {subscription.membershipPlanId.name}
                </h2>
                <p className="text-slate-600 mt-1 dark:text-slate-400">
                  {subscription.membershipPlanId.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  Rs. {subscription.membershipPlanId.price?.toLocaleString()}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  /{subscription.membershipPlanId.duration} days
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4 dark:text-white">
                Membership Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 dark:bg-slate-800">
                    <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium dark:text-slate-400">
                      Start Date
                    </p>
                    <p className="text-slate-900 font-semibold mt-0.5 dark:text-white">
                      {new Date(subscription.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 dark:bg-slate-800">
                    <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium dark:text-slate-400">
                      Valid Until
                    </p>
                    <p className="text-slate-900 font-semibold mt-0.5 dark:text-white">
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-slate-100 flex-wrap dark:border-slate-800">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors cursor-pointer dark:bg-slate-900 dark:border-red-900/50 dark:text-red-500 dark:hover:bg-red-900/20"
                >
                  Cancel Subscription
                </button>
                {(() => {
                  const daysRemaining = Math.ceil(
                    (new Date(subscription.endDate) - new Date()) /
                      (1000 * 60 * 60 * 24),
                  );
                  const isExpiringSoon = daysRemaining <= 7;
                  if (isExpiringSoon) {
                    return (
                      <button
                        onClick={handleRenew}
                        className="px-5 py-2.5 font-medium rounded-lg transition-colors bg-brand-600 text-white hover:bg-brand-700 cursor-pointer"
                      >
                        Renew Plan
                      </button>
                    );
                  }
                  
                  return (
                    <Link
                      to="/member/membership/plans"
                      className="px-5 py-2.5 font-medium rounded-lg transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Change Plan
                    </Link>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
        {history.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Membership History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600 dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-400">
                    <th className="px-6 py-4">Plan Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Start Date</th>
                    <th className="px-6 py-4">End Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                  {history.map((hist) => (
                    <tr
                      key={hist._id}
                      className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {hist.membershipPlanId?.name || "Unknown Plan"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            hist.status === "active"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : hist.status === "cancelled"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {hist.status.charAt(0).toUpperCase() +
                            hist.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {new Date(hist.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {new Date(hist.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MyMembershipPage;
