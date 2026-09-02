import { useState, useEffect } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import api from "../../lib/axios.js";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const StatBlock = ({ label, value, accent = false }) => (
  <div>
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p
      className={`mt-1 text-2xl font-bold ${accent ? "text-brand-600" : "text-slate-900"}`}
    >
      {value}
    </p>
  </div>
);

const TrainerProgressCard = () => {
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data } = await api.get("/progress-data/trainer");
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
      <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
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

  const chartData = {
    labels: ["Completed", "Missed", "Upcoming"],
    datasets: [
      {
        data: [
          progress.completedThisMonth,
          progress.missedThisMonth,
          progress.upcomingThisMonth,
        ],
        backgroundColor: ["#10b981", "#ef4444", "#3b82f6"],
        hoverBackgroundColor: ["#059669", "#dc2626", "#2563eb"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50">
          <TrendingUp className="h-5 w-5 text-brand-600" strokeWidth={2} />
        </div>
        <h3 className="text-base font-bold text-slate-900">This Month</h3>
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
          <span className="text-slate-600">Completion rate</span>
          <span className="font-semibold text-slate-900">
            {progress.completionRate}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all"
            style={{ width: `${progress.completionRate}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <StatBlock
          label="Total Sessions"
          value={progress.totalSessionsThisMonth}
          accent
        />
        <StatBlock label="Members" value={progress.uniqueMembersThisMonth} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
        <div className="flex items-center gap-1 text-slate-600">
          <div className="h-2 w-2 rounded-full bg-success"></div>
          {progress.completedThisMonth} Completed
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <div className="h-2 w-2 rounded-full bg-danger"></div>
          {progress.missedThisMonth} Missed
        </div>
        <div className="flex items-center gap-1 text-slate-600">
          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
          {progress.upcomingThisMonth} Upcoming
        </div>
      </div>
    </div>
  );
};

export default TrainerProgressCard;
