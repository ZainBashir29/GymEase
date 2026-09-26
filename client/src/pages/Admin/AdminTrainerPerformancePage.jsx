import { useAuth } from "../../context/AuthContext.jsx";
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/axios.js";
import { ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Activity, ShieldAlert } from "lucide-react";

const AdminTrainerPerformancePage = () => {
  
  const { hasPermission } = useAuth();
  if (!hasPermission("manage_trainers")) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center p-8">
        <div className="text-center">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
          <p className="text-slate-600">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }
const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await api.get(`/admin/trainers/performance/${id}`);
        setData(response.data.data);
      } catch (err) {
        setError("Failed to load trainer performance");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-danger/20 bg-danger/5 p-6 text-center text-danger">
        {error || "Trainer not found"}
      </div>
    );
  }

  const { trainer, sessionStats, completionRate, totalMembersAssigned } = data;

  const getVerdict = (rate) => {
    if (rate === null) return { text: "No Data", color: "bg-slate-100 text-slate-700" };
    if (rate >= 90) return { text: "Excellent", color: "bg-green-100 text-green-700" };
    if (rate >= 75) return { text: "Good", color: "bg-blue-100 text-blue-700" };
    if (rate >= 50) return { text: "Needs Improvement", color: "bg-amber-100 text-amber-700" };
    return { text: "Poor", color: "bg-red-100 text-red-700" };
  };

  const verdict = getVerdict(completionRate);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/trainers"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Performance Overview
          </h1>
          <p className="text-slate-500 mt-1">
            Session statistics and engagement metrics.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="h-24 w-24 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden border-4 border-white shadow-lg">
          {trainer.profilePictureUrl ? (
            <img
              src={trainer.profilePictureUrl}
              alt={trainer.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-600">
              <span className="text-3xl font-bold">
                {trainer.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold text-slate-900">{trainer.fullName}</h2>
          <p className="text-brand-600 font-medium mt-1">{trainer.specialization}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-500">
            <span>{trainer.email}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className={trainer.isActive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
              {trainer.isActive ? "Active" : "Inactive"}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className={`px-2.5 py-0.5 rounded-full font-medium ${verdict.color}`}>
              Verdict: {verdict.text}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-slate-700 leading-tight">Completion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {completionRate !== null ? `${completionRate}%` : "N/A"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-slate-700 leading-tight">Completed Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {sessionStats.completed}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <XCircle className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-slate-700 leading-tight">Missed Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {sessionStats.missed}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-slate-700 leading-tight">Upcoming Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {sessionStats.upcoming}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-medium text-slate-700 leading-tight">Assigned Members</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {totalMembersAssigned}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminTrainerPerformancePage;
