import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Pricing", to: "/pricing" },
  { label: "Store", to: "/store" },
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <Dumbbell className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            GymEase
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-600"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-brand-600"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;