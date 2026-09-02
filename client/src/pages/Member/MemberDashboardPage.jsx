import {
  LayoutDashboard,
  Dumbbell,
  CreditCard,
  ShoppingBag,
  // MessageCircle
  Package,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";
import TodaySessionCard from "../../components/Dashboard/TodaySessionCard.jsx";
import AttendanceCard from "../../components/Dashboard/AttendanceCard.jsx";
import ProgressCard from "../../components/Dashboard/ProgressCard.jsx";
import QuickLinks from "../../components/Dashboard/QuickLinks.jsx";
import MembershipCard from "../../components/Dashboard/MembershipCard.jsx";
import UpcomingScheduleCard from "../../components/Dashboard/UpcomingScheduleCard.jsx";

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

const MemberDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout navItems={MEMBER_NAV_ITEMS}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.fullName?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's what's happening with your fitness today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <TodaySessionCard />
          <UpcomingScheduleCard />
          <AttendanceCard />
          {/* <QuickLinks /> */}
        </div>

        <div className="space-y-8">
          <ProgressCard />
          <MembershipCard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
