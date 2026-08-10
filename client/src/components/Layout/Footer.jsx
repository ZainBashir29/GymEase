import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Dumbbell className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-slate-900">GymEase</span>
          </Link>

          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} GymEase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
