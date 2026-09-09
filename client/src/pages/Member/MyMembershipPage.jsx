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

const MEMBER_NAV_ITEMS = [
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
          api.get("/memberships/current"),
          api.get("/memberships/history"),
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

  return (
    <DashboardLayout navItems={MEMBER_NAV_ITEMS}>
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">
          My Membership
        </h1>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        ) : !subscription ||
          subscription.status === "cancelled" ||
          subscription.status === "expired" ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No Active Membership
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              You currently do not have an active membership. Subscribe to a
              plan to unlock all GymEase features and gym access.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
            >
              Browse Plans
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-brand-200 shadow-sm overflow-hidden">
            <div className="bg-brand-50 p-6 border-b border-brand-100 flex items-start justify-between flex-wrap gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
                <h2 className="text-3xl font-black text-slate-900">
                  {subscription.membershipPlanId.name}
                </h2>
                <p className="text-slate-600 mt-1">
                  {subscription.membershipPlanId.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">
                  Rs. {subscription.membershipPlanId.price}
                </div>
                <div className="text-sm text-slate-500">
                  /{subscription.membershipPlanId.duration} days
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">
                Membership Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Start Date
                    </p>
                    <p className="text-slate-900 font-semibold mt-0.5">
                      {new Date(subscription.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Valid Until
                    </p>
                    <p className="text-slate-900 font-semibold mt-0.5">
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel Subscription
                </button>
                <Link
                  to="/pricing"
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Change Plan
                </Link>
              </div>
            </div>
          </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
              <th className="px-6 py-4">Plan Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Start Date</th>
              <th className="px-6 py-4">End Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {history.map((hist) => (
              <tr
                key={hist._id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-slate-900">
                  {hist.membershipPlanId?.name || "Unknown Plan"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      hist.status === "active"
                        ? "bg-green-100 text-green-700"
                        : hist.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {hist.status.charAt(0).toUpperCase() + hist.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(hist.startDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(hist.endDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default MyMembershipPage;
