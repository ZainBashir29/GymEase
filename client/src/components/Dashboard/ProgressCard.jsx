import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Loader2, ArrowDown } from "lucide-react";
import api from "../../lib/axios.js";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const StatBlock = ({ label, value, accent = false }) => (
  <div>
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
    <p
      className={`mt-1 text-2xl font-bold ${
        accent ? "text-brand-600" : "text-slate-900 dark:text-white"
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
      <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800">
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
    const getWorkingDaysSoFar = () => {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      let count = 0;
      for (let d = start; d <= today; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0 && d.getDay() !== 6) {
          count++;
        }
      }
      return count;
    };

    const workingDaysSoFar = getWorkingDaysSoFar();
    const missedDays = Math.max(0, workingDaysSoFar - progress.visitsThisMonth);

    const fallbackChartData = {
      labels: ["Present", "Missed"],
      datasets: [
        {
          data: [progress.visitsThisMonth, missedDays],
          backgroundColor: ["#10b981", "#ef4444"],
          hoverBackgroundColor: ["#059669", "#dc2626"],
          borderWidth: 0,
        },
      ],
    };

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
            <TrendingUp className="h-5 w-5 text-brand-600" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Progress</h3>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="h-40 w-40 relative">
            <Doughnut
              data={fallbackChartData}
              options={{
                cutout: "75%",
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <StatBlock
            label="Visits (this month)"
            value={progress.visitsThisMonth}
            accent
          />
          <StatBlock
            label="Last visit"
            value={
              progress.lastVisit
                ? new Date(progress.lastVisit).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "-"
            }
          />
        </div>

        <Link
          to="/member/plans"
          className="mt-6 inline-block w-full text-center rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-brand-600 hover:bg-slate-100 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          Select a gym plan for detailed tracking &rarr;
        </Link>
      </div>
    );
  }

  const chartData = {
    labels: ["Completed", "Missed", "Upcoming"],
    datasets: [
      {
        data: [
          progress.completedSessions || 0,
          progress.missedSessions || 0,
          progress.upcomingSessions || 0,
        ],
        backgroundColor: ["#10b981", "#ef4444", "#3b82f6"],
        hoverBackgroundColor: ["#059669", "#dc2626", "#2563eb"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
            <TrendingUp className="h-5 w-5 text-brand-600" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Progress</h3>
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {progress.remainingDays} days left
        </span>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="h-40 w-40">
          <Doughnut
            data={chartData}
            options={{
              cutout: "75%",
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Attendance</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {progress.attendancePercentage}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${progress.attendancePercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatBlock
          label="Completed"
          value={progress.completedSessions}
          accent
        />
        <StatBlock label="Missed" value={progress.missedSessions} />
        <StatBlock label="Upcoming" value={progress.upcomingSessions} />
      </div>

      {progress.nextSession && (
        <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Next up</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
            {progress.nextSession.workoutName}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressCard;
