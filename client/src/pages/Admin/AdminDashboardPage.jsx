import React, { useState, useEffect } from "react";
import api from "../../lib/axios.js";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  Users,
  UserCheck,
  CreditCard,
  Dumbbell,
  Activity,
  Wallet,
  TrendingUp,
  RefreshCcw,
  Package,
  ShoppingBag,
  Calendar,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 flex items-center gap-4 dark:bg-slate-900 dark:ring-slate-800">
    <div className={`p-4 rounded-xl ${colorClass}`}>
      <Icon className="w-8 h-8" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const { theme } = useTheme();
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

  const last30Days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    last30Days.push(`${year}-${month}-${day}`);
  }

  const dailyDataMap =
    revenue?.thirtyDayRevenue?.reduce((acc, curr) => {
      acc[curr._id] = curr.revenue;
      return acc;
    }, {}) || {};

  const barChartData = {
    labels: last30Days.map((d) => {
      const [year, month, day] = d.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return `${date.getDate()} ${date.toLocaleString("en-US", { month: "short" })}`;
    }),
    datasets: [
      {
        label: "Daily Revenue (Rs.)",
        data: last30Days.map((d) => dailyDataMap[d] || 0),
        backgroundColor: "rgba(37, 99, 235, 0.8)",
        borderRadius: 4,
      },
    ],
  };

  const doughnutData = {
    labels:
      revenue?.revenueByType?.map((r) =>
        r._id ? r._id.charAt(0).toUpperCase() + r._id.slice(1) : "Other",
      ) || [],
    datasets: [
      {
        data: revenue?.revenueByType?.map((r) => r.totalRevenue) || [],
        backgroundColor: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const isDarkMode = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const textColor = isDarkMode ? "#94a3b8" : "#64748b";
  const gridColor = isDarkMode ? "#334155" : "#f1f5f9";

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Rs ${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
      x: { grid: { display: false }, ticks: { maxTicksLimit: 10, color: textColor } },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "75%",
    plugins: {
      legend: { position: "bottom", labels: { color: textColor } },
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Welcome back. Here's your gym's performance.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-white ring-1 ring-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer dark:bg-slate-900 dark:ring-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`Rs. ${revenue?.totalRevenue?.toLocaleString() || 0}`}
          icon={Wallet}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 flex flex-col dark:bg-slate-900 dark:ring-slate-800">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 dark:text-white">
            <TrendingUp className="w-5 h-5 text-brand-500" />
            Revenue (Last 30 Days)
          </h3>
          <div className="flex-1 relative min-h-[300px]">
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 flex flex-col dark:bg-slate-900 dark:ring-slate-800">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 dark:text-white">
            <Activity className="w-5 h-5 text-brand-500" />
            Revenue Breakdown
          </h3>
          {revenue?.revenueByType?.length > 0 ? (
            <>
              <div className="relative h-48 mb-6">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
              <div className="space-y-3 mt-auto">
                {revenue.revenueByType.map((type) => (
                  <div
                    key={type._id}
                    className="flex justify-between items-center text-sm border-t border-slate-100 pt-3 first:border-0 first:pt-0 dark:border-slate-800"
                  >
                    <span className="font-medium text-slate-700 capitalize dark:text-slate-300">
                      {type._id ? type._id.replace(/([A-Z])/g, ' $1').trim() : "Other"}
                    </span>
                    <span className="font-bold text-slate-900 whitespace-nowrap ml-4 dark:text-white">
                      Rs. {type.totalRevenue.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-center py-8 dark:text-slate-400">
              No revenue data available.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden flex flex-col dark:bg-slate-900 dark:ring-slate-800">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center gap-4 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 min-w-0 dark:text-white">
              <ShoppingBag className="w-5 h-5 text-brand-500 shrink-0" />
              <span className="truncate">Recent Orders</span>
            </h3>
            <Link
              to="/admin/orders"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 whitespace-nowrap shrink-0 dark:text-brand-400 dark:hover:text-brand-300"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[400px] dark:divide-slate-800">
            {overview?.recentOrders?.length > 0 ? (
              overview.recentOrders.map((order) => {
                const totalPcs =
                  order.products?.reduce(
                    (sum, p) => sum + (p.quantity || 1),
                    0,
                  ) || 0;
                return (
                  <div
                    key={order._id}
                    className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0 dark:bg-brand-900/30">
                      <Package className="w-5 h-5 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate dark:text-white">
                        {order.memberId?.fullName || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                        {totalPcs} items •{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${
                        order.orderStatus === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : order.orderStatus === "Shipped"
                            ? "bg-blue-100 text-blue-700"
                            : order.orderStatus === "Delivered"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="p-6 text-sm text-slate-500 text-center dark:text-slate-400">
                No recent orders.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden flex flex-col dark:bg-slate-900 dark:ring-slate-800">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center gap-4 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 min-w-0 dark:text-white">
              <Users className="w-5 h-5 text-brand-500 shrink-0" />
              <span className="truncate">Newest Members</span>
            </h3>
            <Link
              to="/admin/members"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 whitespace-nowrap shrink-0 dark:text-brand-400 dark:hover:text-brand-300"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[400px] dark:divide-slate-800">
            {overview?.recentMembers?.length > 0 ? (
              overview.recentMembers.map((member) => (
                  <div
                  key={member._id}
                  className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 dark:bg-slate-800">
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={member.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-700 font-bold text-sm dark:bg-brand-900/30 dark:text-brand-400">
                        {member.fullName?.charAt(0) || "M"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate dark:text-white">
                      {member.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                      {member.email}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-slate-500 text-center dark:text-slate-400">
                No recent members.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden flex flex-col dark:bg-slate-900 dark:ring-slate-800">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center gap-4 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 min-w-0 dark:text-white">
              <Calendar className="w-5 h-5 text-brand-500 shrink-0" />
              <span className="truncate">Today's Schedule</span>
            </h3>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[400px] dark:divide-slate-800">
            {overview?.todaySessions?.length > 0 ? (
              overview.todaySessions.map((session) => (
                <div
                  key={session._id}
                  className="p-4 flex flex-col gap-2 hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50"
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-slate-900 truncate pr-2 dark:text-white">
                      {session.workoutName}
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {session.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex -space-x-2 overflow-hidden shrink-0">
                      {session.memberId?.profilePicture ? (
                        <img
                          src={session.memberId.profilePicture}
                          alt=""
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover dark:ring-slate-900"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:ring-slate-900 dark:bg-slate-800 dark:text-slate-400">
                          {session.memberId?.fullName?.charAt(0) || "M"}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 truncate dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {session.memberId?.fullName?.split(" ")[0]}
                      </span>
                      {" w/ "}
                      <span className="font-semibold text-brand-600 dark:text-brand-400">
                        {session.trainerId?.fullName?.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-slate-500 text-center dark:text-slate-400">
                No sessions scheduled for today.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
