import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { Dumbbell, LogOut, ShoppingCart } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";


const Sidebar = ({ navItems, setIsMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleNavClick = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Dumbbell className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-white">GymEase</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ label, to, icon: Icon, end }) => {
          const isHighlightedOrder = label === "Orders" && location.state?.newOrder;

          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                    : isHighlightedOrder
                      ? "bg-brand-50/60 text-brand-700 hover:bg-brand-50 dark:bg-brand-900/20 dark:text-brand-300 dark:hover:bg-brand-900/40"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4.5 w-4.5" strokeWidth={2} />
                {label}
              </div>
              {isHighlightedOrder && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  1
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {user?.role === "Member" && (
        <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={toggleCart}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-4.5 w-4.5" strokeWidth={2} />
              Cart
            </div>
            {itemCount > 0 && (
              <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <Link 
          to={user?.role ? `/${user.role.toLowerCase()}/dashboard` : "#"} 
          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors cursor-pointer dark:hover:bg-slate-800/50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 overflow-hidden shrink-0 dark:bg-brand-800 dark:text-brand-200">
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
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              {user?.fullName}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-danger ml-2 cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-danger"
        >
          <LogOut className="h-4.5 w-4.5" strokeWidth={2} />
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
