import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Dumbbell,
  CreditCard,
  ShoppingBag,
  Package,
  Settings,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/axios.js";
import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";
import TodaySessionCard from "../../components/Dashboard/TodaySessionCard.jsx";
import AttendanceCard from "../../components/Dashboard/AttendanceCard.jsx";
import ProgressCard from "../../components/Dashboard/ProgressCard.jsx";
import QuickLinks from "../../components/Dashboard/QuickLinks.jsx";
import MembershipCard from "../../components/Dashboard/MembershipCard.jsx";
import UpcomingScheduleCard from "../../components/Dashboard/UpcomingScheduleCard.jsx";
import TrainerTierUpgradeBanner from "../../components/Dashboard/TrainerTierUpgradeBanner.jsx";

const memberSidebarItems = [
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

const MemberDashboard = () => {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState(null);
  const [hasActivePlan, setHasActivePlan] = useState(true);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const checkActivePlan = async () => {
      try {
        const { data } = await api.get(`/gym-plans/active?_t=${Date.now()}`);
        setActivePlan(data.data);
        setHasActivePlan(true);
      } catch (err) {
        setActivePlan(null);
        setHasActivePlan(false);
      } finally {
        setIsLoadingPlan(false);
      }
    };
    checkActivePlan();
  }, [refreshKey]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Here's what's happening with your fitness today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {activePlan?.trainerTierStatus && (
            <TrainerTierUpgradeBanner
              trainerTierStatus={activePlan.trainerTierStatus}
              onRebalanceComplete={() => setRefreshKey((k) => k + 1)}
            />
          )}

          {!isLoadingPlan && !hasActivePlan ? (
            <div className="bg-linear-to-br from-brand-600 to-brand-800 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-12 -top-12 rounded-full bg-white/10 blur-3xl h-64 w-64"></div>
              <div className="relative z-10 flex flex-col items-start">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6">
                  <Dumbbell className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black mb-3 text-white">Select a Gym Plan</h2>
                <p className="text-brand-100 text-lg mb-8 max-w-md leading-relaxed">
                  You don't have an active gym plan yet. Pick a popular routine or generate a custom one to start tracking your daily workouts and get assigned a personal trainer!
                </p>
                <Link 
                  to="/member/plans" 
                  className="bg-white text-brand-700 hover:bg-slate-50 font-bold py-3 px-8 rounded-xl flex items-center gap-2 transition-transform hover:scale-105 shadow-lg"
                >
                  Browse Gym Plans
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <TodaySessionCard key={`today-${refreshKey}`} />
              <UpcomingScheduleCard key={`sched-${refreshKey}`} />
            </>
          )}
          <AttendanceCard />
        </div>

        <div className="space-y-8">
          <ProgressCard />
          <MembershipCard />
        </div>
      </div>
    </>
  );
};

export default MemberDashboard;
