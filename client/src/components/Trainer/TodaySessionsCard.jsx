import { useState, useEffect } from "react";
import { Dumbbell, Loader2, CalendarX, CheckCircle2 } from "lucide-react";
import api from "../../lib/axios.js";

const STATUS_STYLES = {
  completed: "bg-success/10 text-success",
  missed: "bg-danger/10 text-danger",
  upcoming: "bg-brand-100 text-brand-700",
};

const SessionRow = ({ session, onMarkConducted }) => {
  const [isMarking, setIsMarking] = useState(false);
  const [error, setError] = useState("");

  const handleMark = async () => {
    setError("");
    setIsMarking(true);

    try {
      await api.post(`/sessions/mark-conducted/${session._id}`);
      onMarkConducted(session._id);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't mark as conducted.");
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">
            {session.workoutName}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              STATUS_STYLES[session.status]
            }`}
          >
            {session.status}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {session.memberId?.fullName || "Member"}
        </p>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>

      {session.trainerCompletedAt ? (
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-success">
          <CheckCircle2 className="h-4 w-4" />
          Conducted
        </span>
      ) : (
        <button
          onClick={handleMark}
          disabled={isMarking}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isMarking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isMarking ? "Marking..." : "Mark conducted"}
        </button>
      )}
    </div>
  );
};

const TodaySessionsCard = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTodaySessions = async () => {
      try {
        const { data } = await api.get("/sessions/trainer/today");
        setSessions(data.data);
      } catch {
        setError("Couldn't load today's sessions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaySessions();
  }, []);

  const handleMarkConducted = (sessionId) => {
    setSessions((prev) =>
      prev.map((s) =>
        s._id === sessionId
          ? { ...s, trainerCompletedAt: new Date().toISOString() }
          : s,
      ),
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white">
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

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
          <Dumbbell className="h-5 w-5 text-brand-600" strokeWidth={2} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            Today
          </p>
          <h3 className="text-base font-bold text-slate-900">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""}{" "}
            scheduled
          </h3>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CalendarX className="h-7 w-7 text-slate-400" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-slate-500">
            No sessions scheduled today
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sessions.map((session) => (
            <SessionRow
              key={session._id}
              session={session}
              onMarkConducted={handleMarkConducted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodaySessionsCard;
