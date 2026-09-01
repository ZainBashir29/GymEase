import { LayoutDashboard, Users, MessageCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";
import TodaySessionsCard from "../../components/Trainer/TodaySessionsCard.jsx";
import TrainerProgressCard from "../../components/Trainer/TrainerProgressCard.jsx";

const TRAINER_NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/trainer/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { label: "My Members", to: "/trainer/members", icon: Users },
];

const TrainerDashboardPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout navItems={TRAINER_NAV_ITEMS}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's your schedule and progress for today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodaySessionsCard />
        </div>
        <div>
          <TrainerProgressCard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerDashboardPage;
