import { Outlet } from "react-router-dom";
import DashboardLayout from "../Dashboard/DashboardLayout.jsx";
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
  return (
    <DashboardLayout navItems={memberSidebarItems}>
      <Outlet />
    </DashboardLayout>
  );
};

export default MemberLayout;
