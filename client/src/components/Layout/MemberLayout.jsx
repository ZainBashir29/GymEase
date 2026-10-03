import { Outlet } from "react-router-dom";
import DashboardLayout from "../Dashboard/DashboardLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { ShieldAlert } from "lucide-react";
import {
  LayoutDashboard,
  Dumbbell,
  CreditCard,
  ShoppingBag,
  Package,
  Settings,
} from "lucide-react";

export const memberSidebarItems = [
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

const MemberLayout = () => {
  const { user, logout } = useAuth();

  if (user && !user.isActive) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Account Deactivated</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            You are inactive. Contact admin so he could reactivate you.
          </p>
          <button
            onClick={logout}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-medium py-2.5 px-4 rounded-xl transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout navItems={memberSidebarItems}>
      <Outlet />
    </DashboardLayout>
  );
};

export default MemberLayout;
