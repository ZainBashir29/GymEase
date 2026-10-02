import { useState, useEffect } from "react";
import { Dumbbell, Loader2, CalendarX, CheckCircle2 } from "lucide-react";
import api from "../../lib/axios.js";

const TodaySessionCard = () => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completingError, setCompletingError] = useState("");
  const [error, setError] = useState("");

  const fetchTodaySession = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/gym-plans/sessions/member/today");
      setSession(data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setSession(null);
      } else {
        setError("Couldn't load today's session. Please try refreshing.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySession();
  }, []);

  const handleMarkCompleted = async () => {
    if (!session?._id) return;
    setIsCompleting(true);
    setCompletingError("");

    try {
      await api.post(`/gym-plans/sessions/mark-completed/${session._id}`);
      setSession((prev) => ({ ...prev, status: "completed" }));
      window.dispatchEvent(new Event("attendanceUpdated"));
    } catch (err) {
      setCompletingError(
        err.response?.data?.message || "Failed to mark session as completed.",
      );
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
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

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:bg-slate-900 dark:border-slate-700">
        <CalendarX className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
          No session scheduled for today
        </p>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
          Take a rest day, or check your plan for what's next.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600">
            <Dumbbell className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
              Today's session
            </p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {session.workoutName}
            </h3>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            session.status === "completed"
              ? "bg-success/10 text-success"
              : session.status === "missed"
                ? "bg-danger/10 text-danger"
                : "bg-brand-100 text-brand-700"
          }`}
        >
          {session.status}
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {session.exercises?.map((exercise, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 text-sm dark:bg-slate-800"
          >
            <span className="font-medium text-slate-700 dark:text-slate-300">{exercise.name}</span>
            <span className="text-slate-500 dark:text-slate-400">
              {exercise.sets && exercise.reps
                ? `${exercise.sets} × ${exercise.reps}`
                : exercise.duration}
            </span>
          </div>
        ))}
      </div>

      {completingError && (
        <p className="mt-3 text-xs text-danger">{completingError}</p>
      )}

      {session.status === "upcoming" && (
        <div className="mt-5 flex items-center justify-between border-t border-brand-100 pt-4 dark:border-brand-900/50">
          <p className="text-xs text-slate-500 dark:text-slate-400">Finished your workout today?</p>
          <button
            onClick={handleMarkCompleted}
            disabled={isCompleting}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Marking...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Mark as Completed</span>
              </>
            )}
          </button>
        </div>
      )}

      {session.status === "completed" && (
        <div className="mt-5 flex items-center gap-2 border-t border-brand-100 pt-4 text-sm font-medium text-success dark:border-brand-900/50">
          <CheckCircle2 className="h-4 w-4" />
          <span>Workout completed for today! Great work!</span>
        </div>
      )}
    </div>
  );
};

export default TodaySessionCard;
