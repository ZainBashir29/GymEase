import { useAuth } from "../../context/AuthContext.jsx";
import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";
import TodaySessionCard from "../../components/Dashboard/TodaySessionCard.jsx";
import AttendanceCard from "../../components/Dashboard/AttendanceCard.jsx";

const MemberDashboardPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your fitness today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodaySessionCard />
        </div>
        <div>
          <AttendanceCard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboardPage;
