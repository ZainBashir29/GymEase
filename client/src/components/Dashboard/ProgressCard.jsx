import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Loader2 } from "lucide-react";
import api from "../../lib/axios.js";

const StatBlock = ({ label, value, accent = false }) => (
  <div>
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p
      className={`mt-1 text-2xl font-bold ${
        accent ? "text-brand-600" : "text-slate-900"
      }`}
    >
      {value}
    </p>
  </div>
);

const ProgressCard = () => {
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await api.get("/progress-data/member");
        setProgress(data.data);
      } catch {
        setError("Couldn't load your progress.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white">
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

  if (!progress.hasActivePlan) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
            <TrendingUp className="h-5 w-5 text-brand-600" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Your Progress</h3>
        </div>

        <p className="mt-4 text-sm text-slate-600">{progress.message}</p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <StatBlock label="Visits this month" value={progress.visitsThisMonth} accent />
          <StatBlock
            label="Last visit"
            value={
              progress.lastVisit
                ? new Date(progress.lastVisit).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "—"
            }
          />
        </div>

        <Link
          to="/dashboard/plan"
          className="mt-5 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Select a gym plan for detailed tracking →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
            <TrendingUp className="h-5 w-5 text-brand-600" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Your Progress</h3>
        </div>
        <span className="text-sm font-medium text-slate-500">
          {progress.remainingDays} days left
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Attendance</span>
          <span className="font-semibold text-slate-900">
            {progress.attendancePercentage}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${progress.attendancePercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatBlock label="Completed" value={progress.completedSessions} accent />
        <StatBlock label="Missed" value={progress.missedSessions} />
        <StatBlock label="Upcoming" value={progress.upcomingSessions} />
      </div>

      {progress.nextSession && (
        <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium text-slate-500">Next up</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            {progress.nextSession.workoutName}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressCard;