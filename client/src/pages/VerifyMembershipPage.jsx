import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  Dumbbell,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import api from "../lib/axios.js";

const VerifyMembershipPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState("");
  const [checkInErrorMsg, setCheckInErrorMsg] = useState("");

  const handleCheckIn = useCallback(async () => {
    setIsCheckingIn(true);
    setCheckInErrorMsg("");
    setCheckInSuccessMsg("");

    try {
      const { data } = await api.post(`/memberships/verify/check-in/${id}`);
      setResult((prev) => ({
        ...prev,
        isCheckedInToday: true,
        checkedInAt: data.data?.attendance?.date || new Date().toISOString(),
      }));
      setCheckInSuccessMsg(
        data.message || "Member checked in successfully for today!",
      );
    } catch (err) {
      setCheckInErrorMsg(
        err.response?.data?.message || "Failed to check in member.",
      );
    } finally {
      setIsCheckingIn(false);
    }
  }, [id]);

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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600 dark:text-brand-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-danger/20 bg-white p-8 text-center shadow-sm dark:bg-slate-900">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-danger" />
          <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            Verification Failed
          </h1>
          <p className="mb-6 text-slate-600 dark:text-slate-400">{error}</p>
          <Link
            to="/"
            className="inline-block rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const { isValid, user, plan, endDate, isCheckedInToday, checkedInAt } =
    result || {};

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
        
        <div
          className={`p-8 text-center text-white ${
            isValid ? "bg-success" : "bg-danger"
          }`}
        >
          {isValid ? (
            <CheckCircle2 className="mx-auto mb-3 h-16 w-16 opacity-95" />
          ) : (
            <XCircle className="mx-auto mb-3 h-16 w-16 opacity-95" />
          )}
          <h1 className="text-2xl font-bold tracking-tight">
            {isValid ? "Active Member" : "Membership Inactive"}
          </h1>
          <p className="mt-1 font-medium text-white/85">
            {isValid
              ? "Digital ID is valid and in good standing."
              : "Digital ID has expired or has been cancelled."}
          </p>
        </div>

        <div className="space-y-5 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="h-7 w-7 text-slate-400 dark:text-slate-500" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Member
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {user?.fullName || "Gym Member"}
              </p>
              {user?.email && (
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Dumbbell className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Plan
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {plan?.name || "Standard Plan"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Calendar className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Valid Until
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {endDate
                  ? new Date(endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl border p-4 transition-all ${
              isCheckedInToday
                ? "border-success/30 bg-success/5"
                : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    isCheckedInToday
                      ? "bg-success/10 text-success"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Today's Attendance
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {isCheckedInToday
                      ? "Checked In Today"
                      : "Not Checked In Yet"}
                  </p>
                </div>
              </div>

              {isCheckedInToday && checkedInAt && (
                <div className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(checkedInAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </div>

          {checkInSuccessMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm font-semibold text-success">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{checkInSuccessMsg}</span>
            </div>
          )}

          {checkInErrorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm font-semibold text-danger">
              <XCircle className="h-5 w-5 shrink-0" />
              <span>{checkInErrorMsg}</span>
            </div>
          )}

          {isValid && (
            <div className="space-y-3 pt-1">
              {!isCheckedInToday ? (
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckingIn}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-base font-bold text-white shadow-md transition-all hover:bg-brand-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCheckingIn ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Checking in...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      Check In Member
                    </>
                  )}
                </button>
              ) : (
                <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/10 py-3 text-sm font-bold text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  Attendance Recorded for Today
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 p-5 text-center dark:border-slate-800 dark:bg-slate-950">
          <Link
            to="/"
            className="inline-block text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            &larr; Back to GymEase
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyMembershipPage;
