import { LayoutDashboard, Users, MessageCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";
import TodaySessionsCard from "../../components/Trainer/TodaySessionsCard.jsx";
import TrainerProgressCard from "../../components/Trainer/TrainerProgressCard.jsx";
import UpcomingScheduleCard from "../../components/Trainer/UpcomingScheduleCard.jsx";
import AttendanceCard from "../../components/Dashboard/AttendanceCard.jsx";

const trainerNavbarItems = [
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
    <DashboardLayout navItems={trainerNavbarItems}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Here's your schedule and progress for today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TodaySessionsCard />
          <UpcomingScheduleCard />
        </div>
        <div className="space-y-6">
          <AttendanceCard />
          <TrainerProgressCard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TrainerDashboardPage;
