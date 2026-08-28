import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Dumbbell,
  CreditCard,
  ShoppingBag,
  ShoppingCart,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const AdminLayout = () => {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Members", path: "/admin/members", icon: Users },
    { name: "Trainers", path: "/admin/trainers", icon: UserCheck },
    { name: "Gym Plans", path: "/admin/gym-plans", icon: Dumbbell },
    { name: "Memberships", path: "/admin/memberships", icon: CreditCard },
    { name: "Store Products", path: "/admin/store", icon: ShoppingBag },
    { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col md:flex shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-brand-500 rounded p-1.5">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            GymEase Admin
          </span>
        </div>

        <div className="px-4 pb-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm py-2 px-3 rounded-lg hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Website
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white font-medium"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500 rounded p-1">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">Admin</span>
          </div>
          <Link to="/" className="text-sm font-medium text-brand-600">
            Exit
          </Link>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
