import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Loader2, AlertTriangle } from "lucide-react";
import api from "../../lib/axios.js";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const MembershipCard = () => {
  const [membership, setMembership] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const { data } = await api.get("/memberships/current");
        setMembership(data.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setMembership(null);
        } else {
          setError("Couldn't load membership details.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembership();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
        {error}
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
        <CreditCard
          className="mx-auto h-7 w-7 text-slate-400"
          strokeWidth={1.5}
        />
        <p className="mt-3 text-sm font-medium text-slate-600">
          No active membership
        </p>
        <Link
          to="/pricing"
          className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          View plans →
        </Link>
      </div>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24),
  );
  const isExpiringSoon = daysRemaining <= 3 && daysRemaining >= 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
          <CreditCard className="h-5 w-5 text-brand-600" strokeWidth={2} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Membership
          </p>
          <h3 className="text-base font-bold text-slate-900">
            {membership.membershipPlanId?.name || "Active Plan"}
          </h3>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
        <span className="text-sm text-slate-600">Renews / expires</span>
        <span className="text-sm font-semibold text-slate-900">
          {formatDate(membership.endDate)}
        </span>
      </div>

      {isExpiringSoon && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Your membership expires in {daysRemaining}{" "}
            {daysRemaining === 1 ? "day" : "days"}. Renew to avoid interruption.
          </span>
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Link
          to="/member/membership"
          className="text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Manage Membership →
        </Link>
      </div>
    </div>
  );
};

export default MembershipCard;
