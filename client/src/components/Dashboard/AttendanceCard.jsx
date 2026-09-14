import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import api from "../../lib/axios.js";

const AttendanceCard = () => {
  const [isMarked, setIsMarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data } = await api.get("/attendance/today-status");
        setIsMarked(data.data.marked);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();

    const handleAttendanceUpdated = () => {
      checkStatus();
    };

    window.addEventListener("attendanceUpdated", handleAttendanceUpdated);
    return () => {
      window.removeEventListener("attendanceUpdated", handleAttendanceUpdated);
    };
  }, []);

  const handleMarkAttendance = async () => {
    setError("");
    setIsMarking(true);

    try {
      await api.post("/attendance/mark");
      setIsMarked(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't mark attendance. Please try again.",
      );
    } finally {
      setIsMarking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            isMarked ? "bg-success/10" : "bg-slate-100"
          }`}
        >
          <MapPin
            className={`h-5 w-5 ${isMarked ? "text-success" : "text-slate-500"}`}
            strokeWidth={2}
          />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Attendance
          </p>
          <h3 className="text-base font-bold text-slate-900">
            {isMarked ? "You're checked in today" : "Not checked in yet"}
          </h3>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {!isMarked && (
        <button
          onClick={handleMarkAttendance}
          disabled={isMarking}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {isMarking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {isMarking ? "Marking..." : "Mark attendance"}
        </button>
      )}
    </div>
  );
};

export default AttendanceCard;
