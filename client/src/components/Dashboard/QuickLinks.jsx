import { Link } from "react-router-dom";
import { ShoppingBag, MessageCircle, ArrowRight } from "lucide-react";

const QUICK_LINKS = [
  {
    label: "Browse Store",
    description: "Supplements & gym gear",
    to: "/dashboard/store",
    icon: ShoppingBag,
  },
  {
    label: "Messages",
    description: "Chat with your trainer",
    to: "/dashboard/chat",
    icon: MessageCircle,
  },
];

const QuickLinks = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {QUICK_LINKS.map(({ label, description, to, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-brand-200 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
              <Icon className="h-4.5 w-4.5 text-brand-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{label}</p>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-brand-600" />
        </Link>
      ))}
    </div>
  );
};

export default QuickLinks;