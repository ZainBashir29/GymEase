import React, { useState, useEffect } from "react";
import api from "../../lib/axios.js";
import {
  Users,
  UserCheck,
  CreditCard,
  Dumbbell,
  Activity,
  DollarSign,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 flex items-center gap-4">
    <div className={`p-4 rounded-xl ${colorClass}`}>
      <Icon className="w-8 h-8" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes] = await Promise.all([
        api.get("/admin/analytics/overview"),
        api.get("/admin/analytics/revenue"),
      ]);
      setOverview(overviewRes.data.data);
      setRevenue(revenueRes.data.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back. Here's what's happening today.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-white ring-1 ring-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${revenue?.totalRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          colorClass="bg-green-100 text-green-700"
        />
        <StatCard
          title="Active Members"
          value={overview?.totalActiveMembers || 0}
          icon={Users}
          colorClass="bg-brand-100 text-brand-700"
        />
        <StatCard
          title="Active Trainers"
          value={overview?.totalActiveTrainers || 0}
          icon={UserCheck}
          colorClass="bg-blue-100 text-blue-700"
        />
        <StatCard
          title="Active Memberships"
          value={overview?.totalActiveMemberships || 0}
          icon={CreditCard}
          colorClass="bg-purple-100 text-purple-700"
        />
        <StatCard
          title="Active Gym Plans"
          value={overview?.totalActiveGymPlans || 0}
          icon={Dumbbell}
          colorClass="bg-orange-100 text-orange-700"
        />
        <StatCard
          title="Sessions Today"
          value={overview?.todaySessionsCount || 0}
          icon={Activity}
          colorClass="bg-rose-100 text-rose-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            Revenue Breakdown
          </h3>
          {revenue?.revenueByType?.length > 0 ? (
            <div className="space-y-4">
              {revenue.revenueByType.map((type) => (
                <div
                  key={type._id}
                  className="flex justify-between items-center p-3 rounded-lg bg-slate-50"
                >
                  <span className="font-medium text-slate-700 capitalize">
                    {type._id}
                  </span>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      ${type.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {type.transactionCount} transactions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">
              No revenue data available.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Manage Your Gym</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            Use the sidebar navigation to manage members, trainers, plans, and
            store products.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
