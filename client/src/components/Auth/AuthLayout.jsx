import { Link } from "react-router-dom";
import { Dumbbell } from "lucide-react";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
            <Dumbbell className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            GymEase
          </span>
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
