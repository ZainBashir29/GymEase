import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  Dumbbell,
} from "lucide-react";
import api from "../lib/axios.js";

const VerifyMembershipPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/memberships/verify/${id}`);
        setResult(data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Verification failed. Invalid QR code or server error.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    verify();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-danger/20 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto h-16 w-16 text-danger mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Verification Failed
          </h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { isValid, user, plan, endDate } = result;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg">
        {/* Header */}
        <div
          className={`p-8 text-center text-white ${isValid ? "bg-success" : "bg-danger"}`}
        >
          {isValid ? (
            <CheckCircle2 className="mx-auto h-16 w-16 mb-4 opacity-90" />
          ) : (
            <XCircle className="mx-auto h-16 w-16 mb-4 opacity-90" />
          )}
          <h1 className="text-2xl font-bold tracking-tight">
            {isValid ? "Active Member" : "Membership Inactive"}
          </h1>
          <p className="mt-2 text-white/80 font-medium">
            {isValid
              ? "This digital ID is valid and active."
              : "This digital ID has expired or is invalid."}
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 shrink-0">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName}
                  className="h-full w-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                Member
              </p>
              <p className="text-lg font-bold text-slate-900">
                {user?.fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 shrink-0">
              <Dumbbell className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                Plan
              </p>
              <p className="text-lg font-bold text-slate-900">
                {plan?.name || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 shrink-0">
              <Calendar className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                Valid Until
              </p>
              <p className="text-lg font-bold text-slate-900">
                {new Date(endDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <Link
            to="/"
            className="inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Go to GymEase
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyMembershipPage;
