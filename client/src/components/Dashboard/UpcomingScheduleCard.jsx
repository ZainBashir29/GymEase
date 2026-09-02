import { useState, useEffect } from "react";
import { Loader2, CalendarDays, CalendarX } from "lucide-react";
import api from "../../lib/axios.js";
import MemberSessionModal from "./MemberSessionModal.jsx";

const STATUS_STYLES = {
  completed: "bg-success/10 text-success",
  missed: "bg-danger/10 text-danger",
  upcoming: "bg-brand-100 text-brand-700",
};

const UpcomingSessionRow = ({ session, onClick }) => {
  return (
    <div
      onClick={() => onClick(session)}
      className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-200 group"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
            {session.workoutName}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[session.status]}`}
          >
            {session.status}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-medium text-slate-500">
          with Trainer {session.trainerId?.fullName || "Trainer"}
        </p>
      </div>
    </div>
  );
};

const UpcomingScheduleCard = () => {
  const [groupedSessions, setGroupedSessions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      try {
        const { data } = await api.get("/gym-plans/sessions/member");
        const allSessions = data.data || [];

        // Filter out today and past sessions
        const startOfTomorrow = new Date();
        startOfTomorrow.setHours(24, 0, 0, 0);

        const futureSessions = allSessions.filter(
          (s) => new Date(s.date) >= startOfTomorrow,
        );

        // Group by Date (ignoring time)
        const groups = {};
        futureSessions.forEach((session) => {
          const dateStr = new Date(session.date).toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          });
          if (!groups[dateStr]) groups[dateStr] = [];
          groups[dateStr].push(session);
        });

        const sortedGroups = {};
        Object.keys(groups)
          .sort(
            (a, b) => new Date(groups[a][0].date) - new Date(groups[b][0].date),
          )
          .forEach((key) => {
            sortedGroups[key] = groups[key];
          });

        setGroupedSessions(sortedGroups);
      } catch {
        setError("Couldn't load upcoming sessions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingSessions();
  }, []);

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
    <>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
            <CalendarDays className="h-5 w-5 text-indigo-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
              Schedule
            </p>
            <h3 className="text-base font-bold text-slate-900">
              Upcoming Workouts
            </h3>
          </div>
        </div>

        {Object.keys(groupedSessions).length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center">
            <CalendarX className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
            <p className="mt-3 text-sm font-medium text-slate-600">
              No upcoming sessions scheduled
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Check back when you have an active gym plan!
            </p>
          </div>
        ) : (
          <div className="max-h-[300px] space-y-6 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
            {Object.entries(groupedSessions).map(([dateLabel, sessions]) => (
              <div key={dateLabel}>
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  {dateLabel}
                </h4>
                <div className="space-y-2.5">
                  {sessions.map((session) => (
                    <UpcomingSessionRow
                      key={session._id}
                      session={session}
                      onClick={setSelectedSession}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <MemberSessionModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </>
  );
};

export default UpcomingScheduleCard;
