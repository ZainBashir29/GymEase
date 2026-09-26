import { useAuth } from "../../context/AuthContext.jsx";
import React, { useState, useEffect } from "react";
import api from "../../lib/axios.js";
import { Plus, Trash2, Edit2, X, CheckCircle2, ChevronDown, ChevronUp, RotateCcw, ShieldAlert } from "lucide-react";

const emptyExercise = () => ({ name: "", sets: "", reps: "", duration: "" });
const emptySession = () => ({ name: "", exercises: [emptyExercise()], open: true });

const AdminGymPlansPage = () => {
  
  const { hasPermission } = useAuth();
  if (!hasPermission("manage_gym_plans")) {
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
const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    details: "",
    sessions: [emptySession()],
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/gym-plans?includeInactive=${includeInactive}`,
      );
      setPlans(data.data || []);
    } catch (error) {
      console.error("Failed to fetch gym plans", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [includeInactive]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this gym plan?"))
      return;
    try {
      await api.delete(`/admin/delete-gym-plan/${id}`);
      fetchPlans();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete plan");
    }
  };

  const handleReactivate = async (id) => {
    if (!window.confirm("Reactivate this gym plan?")) return;
    try {
      await api.patch(`/admin/reactivate-gym-plan/${id}`);
      fetchPlans();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to reactivate plan");
    }
  };

  const openAddModal = () => {
    setEditingPlanId(null);
    setFormData({
      name: "",
      description: "",
      duration: 30,
      details: "",
      sessions: [emptySession()],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlanId(plan._id);
    setFormData({
      name: plan.name,
      description: plan.description,
      duration: plan.duration,
      details: plan.details || "",
      sessions: (plan.sessions || []).map((s) => ({
        name: s.name || "",
        open: false,
        exercises: (s.exercises || []).map((ex) => ({
          name: ex.name || "",
          sets: ex.sets ?? "",
          reps: ex.reps ?? "",
          duration: ex.duration || "",
        })),
      })),
    });
    setIsModalOpen(true);
  };

  // ── Session helpers ──────────────────────────────────────────────────────────
  const addSession = () =>
    setFormData((f) => ({ ...f, sessions: [...f.sessions, emptySession()] }));

  const removeSession = (si) =>
    setFormData((f) => ({
      ...f,
      sessions: f.sessions.filter((_, i) => i !== si),
    }));

  const toggleSession = (si) =>
    setFormData((f) => ({
      ...f,
      sessions: f.sessions.map((s, i) =>
        i === si ? { ...s, open: !s.open } : s,
      ),
    }));

  const updateSession = (si, field, value) =>
    setFormData((f) => ({
      ...f,
      sessions: f.sessions.map((s, i) =>
        i === si ? { ...s, [field]: value } : s,
      ),
    }));

  // ── Exercise helpers ─────────────────────────────────────────────────────────
  const addExercise = (si) =>
    setFormData((f) => ({
      ...f,
      sessions: f.sessions.map((s, i) =>
        i === si ? { ...s, exercises: [...s.exercises, emptyExercise()] } : s,
      ),
    }));

  const removeExercise = (si, ei) =>
    setFormData((f) => ({
      ...f,
      sessions: f.sessions.map((s, i) =>
        i === si
          ? { ...s, exercises: s.exercises.filter((_, j) => j !== ei) }
          : s,
      ),
    }));

  const updateExercise = (si, ei, field, value) =>
    setFormData((f) => ({
      ...f,
      sessions: f.sessions.map((s, i) =>
        i === si
          ? {
              ...s,
              exercises: s.exercises.map((ex, j) =>
                j === ei ? { ...ex, [field]: value } : ex,
              ),
            }
          : s,
      ),
    }));

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validate sessions
    for (let i = 0; i < formData.sessions.length; i++) {
      const s = formData.sessions[i];
      if (!s.name.trim()) {
        alert(`Session ${i + 1} needs a name.`);
        setSubmitting(false);
        return;
      }
      for (let j = 0; j < s.exercises.length; j++) {
        const ex = s.exercises[j];
        if (!ex.name.trim()) {
          alert(`Session ${i + 1}, Exercise ${j + 1} needs a name.`);
          setSubmitting(false);
          return;
        }
      }
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      duration: Number(formData.duration),
      details: formData.details,
      sessions: formData.sessions.map(({ name, exercises }) => ({
        name,
        exercises: exercises.map(({ name, sets, reps, duration }) => ({
          name,
          ...(sets !== "" && { sets: Number(sets) }),
          ...(reps !== "" && { reps: Number(reps) }),
          ...(duration.trim() !== "" && { duration }),
        })),
      })),
    };

    try {
      if (editingPlanId) {
        await api.patch(`/admin/update-gym-plan/${editingPlanId}`, payload);
      } else {
        await api.post("/admin/add-gym-plan", payload);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
          (editingPlanId ? "Failed to update plan" : "Failed to add plan"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gym Plans</h1>
          <p className="text-slate-500 mt-1">
            Manage popular workout plans available to members.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-slate-700">Show Inactive</span>
          </label>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl shadow-sm">
            <p className="text-slate-500">No gym plans available.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              {!plan.isActive && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded z-10">
                  INACTIVE
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {plan.name}
                </h3>
                <span className="text-sm font-semibold text-brand-600">
                  {plan.duration} Days Program
                </span>
              </div>

              <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                {plan.description}
              </p>

              <div className="space-y-2 mb-8 flex-1">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700">{plan.details}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(plan)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                {plan.isActive && (
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deactivate
                  </button>
                )}
                {!plan.isActive && (
                  <button
                    onClick={() => handleReactivate(plan._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reactivate
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPlanId ? "Edit Gym Plan" : "Add New Gym Plan"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              <form id="gymPlanForm" onSubmit={handleSubmit} className="space-y-5">
                {/* Plan name + duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Plan Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="e.g. Muscle Builder"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Duration (days) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      placeholder="e.g. 30"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="2"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-sm"
                    placeholder="e.g. Build muscle mass and increase strength..."
                  />
                </div>

                {/* Details */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Details <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    placeholder="e.g. Includes weightlifting and cardio..."
                  />
                </div>

                {/* Session Builder */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">
                      Workout Sessions <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addSession}
                      className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Session
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.sessions.map((session, si) => (
                      <div
                        key={si}
                        className="border border-slate-200 rounded-xl overflow-hidden"
                      >
                        {/* Session header */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                          <button
                            type="button"
                            onClick={() => toggleSession(si)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                          >
                            {session.open ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <input
                            type="text"
                            required
                            value={session.name}
                            onChange={(e) => updateSession(si, "name", e.target.value)}
                            className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                            placeholder={`Session ${si + 1} name, e.g. Day ${si + 1}: Upper Body`}
                          />
                          {formData.sessions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSession(si)}
                              className="text-red-400 hover:text-red-600 cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Exercises */}
                        {session.open && (
                          <div className="p-4 space-y-2">
                            {/* Column labels */}
                            <div className="grid gap-2 text-[10px] text-slate-400 uppercase tracking-wide px-0.5"
                              style={{ gridTemplateColumns: "1fr 56px 56px 80px 20px" }}
                            >
                              <span>Exercise</span>
                              <span className="text-center">Sets</span>
                              <span className="text-center">Reps</span>
                              <span>Duration</span>
                              <span />
                            </div>

                            {session.exercises.map((ex, ei) => (
                              <div
                                key={ei}
                                className="grid gap-2 items-center"
                                style={{ gridTemplateColumns: "1fr 56px 56px 80px 20px" }}
                              >
                                <input
                                  type="text"
                                  required
                                  value={ex.name}
                                  onChange={(e) => updateExercise(si, ei, "name", e.target.value)}
                                  className="min-w-0 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  placeholder="Exercise name"
                                />
                                <input
                                  type="number"
                                  min="1"
                                  value={ex.sets}
                                  onChange={(e) => updateExercise(si, ei, "sets", e.target.value)}
                                  className="min-w-0 w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  placeholder="—"
                                />
                                <input
                                  type="number"
                                  min="1"
                                  value={ex.reps}
                                  onChange={(e) => updateExercise(si, ei, "reps", e.target.value)}
                                  className="min-w-0 w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  placeholder="—"
                                />
                                <input
                                  type="text"
                                  value={ex.duration}
                                  onChange={(e) => updateExercise(si, ei, "duration", e.target.value)}
                                  className="min-w-0 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  placeholder="e.g. 30s"
                                />
                                <div className="flex justify-center">
                                  {session.exercises.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeExercise(si, ei)}
                                      className="text-red-400 hover:text-red-600 cursor-pointer"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => addExercise(si)}
                              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium cursor-pointer mt-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Exercise
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                form="gymPlanForm"
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : editingPlanId ? (
                  "Save Changes"
                ) : (
                  "Add Plan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGymPlansPage;
