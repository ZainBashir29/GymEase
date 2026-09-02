import { NavLink } from "react-router-dom";
import { Dumbbell, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const Sidebar = ({ navItems }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Dumbbell className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-base font-bold text-slate-900">GymEase</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 overflow-hidden shrink-0">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              user?.fullName?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.fullName}
            </p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-danger ml-2"
        >
          <LogOut className="h-4.5 w-4.5" strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
