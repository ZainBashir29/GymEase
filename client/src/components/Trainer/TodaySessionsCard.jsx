import { useState, useEffect } from "react";
import { Dumbbell, Loader2, CalendarX, CheckCircle2, X, Clock, Activity, User as UserIcon } from "lucide-react";
import api from "../../lib/axios.js";

const statusStyles = {
  completed: "bg-success/10 text-success",
  missed: "bg-danger/10 text-danger",
  upcoming: "bg-brand-100 text-brand-700",
};

const SessionModal = ({ session, onClose, onMarkConducted }) => {
  const [isMarking, setIsMarking] = useState(false);
  const [error, setError] = useState("");

  const handleMark = async () => {
    setError("");
    setIsMarking(true);

    try {
      await api.post(`/gym-plans/sessions/mark-conducted/${session._id}`);
      window.dispatchEvent(new Event("attendanceUpdated"));
      onMarkConducted(session._id);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't mark as conducted.");
    } finally {
      setIsMarking(false);
    }
  };

  if (!session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-brand-100 ring-2 ring-white dark:bg-brand-900/50 dark:ring-slate-800">
              {session.memberId?.profilePicture ? (
                <img src={session.memberId.profilePicture} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="h-6 w-6 text-brand-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{session.memberId?.fullName || "Member"}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{session.workoutName}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[session.status]}`}>
                  {session.status}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer dark:hover:bg-slate-700 dark:hover:text-slate-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        
        <div className="max-h-[60vh] overflow-y-auto p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <Dumbbell className="h-4 w-4" />
            Workout Details
          </h3>
          
          {(!session.exercises || session.exercises.length === 0) ? (
            <p className="text-sm text-slate-500 italic dark:text-slate-400">No exercises detailed for this session.</p>
          ) : (
            <div className="space-y-4">
              {session.exercises.map((ex, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white">{ex.name}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                    {ex.sets && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 dark:bg-slate-900/50 dark:border-slate-600">
                        <Activity className="h-3.5 w-3.5 text-brand-600" />
                        <span><span className="font-bold text-slate-900 dark:text-white">{ex.sets}</span> sets</span>
                      </div>
                    )}
                    {ex.reps && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 dark:bg-slate-900/50 dark:border-slate-600">
                        <Dumbbell className="h-3.5 w-3.5 text-brand-600" />
                        <span><span className="font-bold text-slate-900 dark:text-white">{ex.reps}</span> reps</span>
                      </div>
                    )}
                    {ex.duration && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 dark:bg-slate-900/50 dark:border-slate-600">
                        <Clock className="h-3.5 w-3.5 text-brand-600" />
                        <span className="font-bold text-slate-900 dark:text-white">{ex.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        
        <div className="border-t border-slate-100 bg-slate-50 p-6 flex flex-col gap-2 dark:bg-slate-800/50 dark:border-slate-700">
          {error && <p className="text-center text-sm text-danger">{error}</p>}
          
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700">
              Close
            </button>
            {!session.trainerCompletedAt && (
              <button
                onClick={handleMark}
                disabled={isMarking}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 transition-colors cursor-pointer"
              >
                {isMarking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {isMarking ? "Marking..." : "Mark Conducted"}
              </button>
            )}
          </div>
          {session.trainerCompletedAt && (
            <p className="text-center text-sm font-medium text-success mt-1 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> You have conducted this session.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const SessionRow = ({ session, onClick, onMarkConducted }) => {
  const [isMarking, setIsMarking] = useState(false);
  const [error, setError] = useState("");

  const handleMark = async (e) => {
    e.stopPropagation(); 
    setError("");
    setIsMarking(true);

    try {
      await api.post(`/gym-plans/sessions/mark-conducted/${session._id}`);
      onMarkConducted(session._id);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't mark as conducted.");
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div 
      onClick={() => onClick(session)}
      className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5 transition-colors hover:bg-slate-100 hover:border-slate-200 group dark:bg-slate-800/50 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:border-slate-600"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition-colors dark:text-white dark:group-hover:text-brand-400">
            {session.workoutName}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              statusStyles[session.status]
            }`}
          >
            {session.status}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          with {session.memberId?.fullName || "Member"}
        </p>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>

      {session.trainerCompletedAt ? (
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold text-success">
          <CheckCircle2 className="h-4 w-4" />
          Conducted
        </span>
      ) : (
        <button
          onClick={handleMark}
          disabled={isMarking}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-600"
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
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const fetchTodaySessions = async () => {
      try {
        const { data } = await api.get("/gym-plans/sessions/trainer/today");
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
    
    if (selectedSession && selectedSession._id === sessionId) {
      setSelectedSession(prev => ({ ...prev, trainerCompletedAt: new Date().toISOString() }));
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

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/30">
            <Dumbbell className="h-5 w-5 text-brand-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
              Today
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""}{" "}
              scheduled
            </h3>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarX className="h-7 w-7 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              No sessions scheduled today
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessions.map((session) => (
              <SessionRow
                key={session._id}
                session={session}
                onClick={setSelectedSession}
                onMarkConducted={handleMarkConducted}
              />
            ))}
          </div>
        )}
      </div>

      <SessionModal 
        session={selectedSession} 
        onClose={() => setSelectedSession(null)} 
        onMarkConducted={handleMarkConducted}
      />
    </>
  );
};

export default TodaySessionsCard;
