import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Dumbbell, ShoppingCart, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

const navbarLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Pricing", to: "/pricing" },
  { label: "Store", to: "/store" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasNavigatedAway, setHasNavigatedAway] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/") {
      setHasNavigatedAway(true);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 relative">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <Dumbbell className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            GymEase
          </span>
        </Link>

        <div className="hidden absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex">
          {navbarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => {
                const showActive =
                  isActive && (link.to !== "/" || hasNavigatedAway);
                return `text-sm font-medium transition-colors ${showActive
                    ? "text-brand-600 font-semibold"
                    : "text-slate-600 hover:text-brand-600"
                  }`;
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === "Member" && (
                <button
                  onClick={toggleCart}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </button>
              )}
              <Link
                to={
                  user.role === "Trainer"
                    ? "/trainer/dashboard"
                    : user.role === "Admin"
                      ? "/admin/dashboard"
                      : "/member/dashboard"
                }
                className="hidden sm:flex items-center gap-2.5 rounded-full bg-brand-50 pl-2 pr-4 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors border border-brand-100"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-200 text-brand-800 overflow-hidden shrink-0">
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
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="hidden sm:block rounded-lg bg-red-200 px-4 py-2 text-sm font-semibold text-danger transition-colors hover:bg-red-300 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:block text-sm font-semibold text-slate-700 transition-colors hover:text-brand-600"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                Get Started
              </Link>
            </>
          )}

          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg -mr-2 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white absolute w-full left-0 right-0 shadow-lg">
          <div className="flex flex-col">
            {navbarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-base font-medium px-6 py-4 border-b border-slate-100 transition-colors ${isActive && link.to !== "/"
                    ? "text-brand-600 font-semibold bg-brand-50 border-l-2 border-l-brand-600"
                    : "text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-base font-medium text-red-600 hover:bg-red-50 px-6 py-4 sm:hidden"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 px-6 py-4 sm:hidden"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
