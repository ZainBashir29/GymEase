import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  Menu,
  LayoutDashboard,
  Users,
  UserCheck,
  Dumbbell,
  CreditCard,
  ShoppingBag,
  ShoppingCart,
  LogOut,
  ChevronLeft,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useChat } from "../../context/ChatContext.jsx";
import ChatWidget from "../Chat/ChatWidget.jsx";

const AdminLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, hasPermission, isSystemAdmin } = useAuth();
  const { toggleChatWindow, unreadCount } = useChat();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Overview",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
      systemAdminOnly: true,
    },
    {
      name: "Members",
      path: "/admin/members",
      icon: Users,
      perm: "manage_members",
    },
    {
      name: "Trainers",
      path: "/admin/trainers",
      icon: UserCheck,
      perm: "manage_trainers",
    },
    {
      name: "Gym Plans",
      path: "/admin/gym-plans",
      icon: Dumbbell,
      perm: "manage_gym_plans",
    },
    {
      name: "Memberships",
      path: "/admin/memberships",
      icon: CreditCard,
      perm: "manage_membership_plans",
    },
    {
      name: "Store Products",
      path: "/admin/store",
      icon: ShoppingBag,
      perm: "manage_products",
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingCart,
      perm: "manage_orders",
    },
  ];

  if (isSystemAdmin) {
    navItems.push({
      name: "Sub-Admins",
      path: "/admin/sub-admins",
      icon: ShieldCheck,
    });
  }

  const filteredNavItems = navItems.filter((item) => {
    if (item.systemAdminOnly && !isSystemAdmin) return false;
    return !item.perm || hasPermission(item.perm);
  });

  useEffect(() => {
    if (
      pathname === "/admin/dashboard" ||
      pathname === "/admin" ||
      pathname === "/admin/"
    ) {
      if (!isSystemAdmin && filteredNavItems.length > 0) {
        navigate(filteredNavItems[0].path, { replace: true });
      }
    }
  }, [pathname, isSystemAdmin, navigate]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative dark:bg-slate-950">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden cursor-pointer"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-brand-500 rounded p-1.5 shrink-0">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            GymEase Admin
          </span>
        </div>

        <div className="px-4 pb-2 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors text-sm py-2 px-3 rounded-lg dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Website
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive
                    ? "bg-brand-50 text-brand-700 font-medium dark:bg-brand-900/30 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white"
                  }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-brand-700 dark:text-brand-300" : "text-slate-400"}`}
                />
                {item.name}
              </Link>
            );
          })}

          {true && (
            <button
              type="button"
              onClick={toggleChatWindow}
              className="flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-slate-400" />
                <span>Messages</span>
              </div>
              {unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 -ml-1 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-brand-500 rounded p-1 hidden sm:block">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {true && (
              <button
                type="button"
                onClick={toggleChatWindow}
                className="relative p-1 text-slate-600 hover:text-brand-600 transition-colors cursor-pointer dark:text-slate-400 dark:hover:text-brand-400"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}

            <Link to="/" className="text-sm font-medium text-brand-600 dark:text-brand-400">
              Exit
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </main>

      <ChatWidget />
    </div>
  );
};

export default AdminLayout;
