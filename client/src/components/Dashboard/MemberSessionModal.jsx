import { useState } from "react";
import {
  Dumbbell,
  X,
  Clock,
  Activity,
  User as UserIcon,
  CheckCircle2,
  Loader2,
  CalendarDays,
} from "lucide-react";
import api from "../../lib/axios.js";

const statusStyles = {
  completed: "bg-success/10 text-success",
  missed: "bg-danger/10 text-danger",
  upcoming: "bg-brand-100 text-brand-700",
};

const MemberSessionModal = ({ session, onClose, onMarkCompleted }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState("");
  const [isDone, setIsDone] = useState(session?.status === "completed");

  if (!session) return null;

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const isFutureSession = session.date && new Date(session.date) > endOfToday;

  const handleMark = async () => {
    setError("");
    setIsCompleting(true);

    try {
      await api.post(`/gym-plans/sessions/mark-completed/${session._id}`);
      setIsDone(true);
      window.dispatchEvent(new Event("attendanceUpdated"));
      onMarkCompleted?.(session._id);
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't mark session as completed.",
      );
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl my-10">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-brand-100 ring-2 ring-white">
              {session.trainerId?.profilePicture ? (
                <img
                  src={session.trainerId.profilePicture}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="h-6 w-6 text-brand-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Trainer {session.trainerId?.fullName || "Trainer"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-medium text-slate-500">
                  {session.workoutName}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[isDone ? "completed" : session.status]}`}
                >
                  {isDone ? "completed" : session.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
            <Dumbbell className="h-4 w-4" />
            Workout Details
          </h3>

          {!session.exercises || session.exercises.length === 0 ? (
            <p className="text-sm text-slate-500 italic">
              No exercises detailed for this session.
            </p>
          ) : (
            <div className="space-y-4">
              {session.exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <p className="font-bold text-slate-900">{ex.name}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                    {ex.sets && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                        <Activity className="h-3.5 w-3.5 text-brand-600" />
                        <span>
                          <span className="font-bold text-slate-900">
                            {ex.sets}
                          </span>{" "}
                          sets
                        </span>
                      </div>
                    )}
                    {ex.reps && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                        <Dumbbell className="h-3.5 w-3.5 text-brand-600" />
                        <span>
                          <span className="font-bold text-slate-900">
                            {ex.reps}
                          </span>{" "}
                          reps
                        </span>
                      </div>
                    )}
                    {ex.duration && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                        <Clock className="h-3.5 w-3.5 text-brand-600" />
                        <span className="font-bold text-slate-900">
                          {ex.duration}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 p-6 flex flex-col gap-2">
          {error && <p className="text-xs text-danger mb-1">{error}</p>}

          {!isDone &&
            session.status === "upcoming" &&
            (isFutureSession ? (
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-100 p-3 text-xs font-medium text-slate-600">
                <CalendarDays className="h-4 w-4 text-slate-400 shrink-0" />
                <span>
                  Scheduled for{" "}
                  {new Date(session.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  . This session can only be completed on that day.
                </span>
              </div>
            ) : (
              <button
                onClick={handleMark}
                disabled={isCompleting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 transition-colors cursor-pointer"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Marking Completed...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Mark Workout as Completed</span>
                  </>
                )}
              </button>
            ))}

          {isDone && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 py-2.5 text-sm font-bold text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span>Workout Completed!</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberSessionModal;
