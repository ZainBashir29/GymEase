import React, { useState, useEffect } from "react";
import api from "../../lib/axios.js";
import { Plus, Trash2, Edit2, X, CheckCircle2 } from "lucide-react";

const AdminGymPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    details: "",
    sessionsJson: "",
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/gym-plans?includeInactive=true");
      setPlans(data.data || []);
    } catch (error) {
      console.error("Failed to fetch gym plans", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

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

  const openAddModal = () => {
    setEditingPlanId(null);
    setFormData({
      name: "",
      description: "",
      duration: 30,
      details: "",
      sessionsJson:
        '[\n  {\n    "name": "Day 1: Full Body",\n    "exercises": [\n      { "name": "Pushups", "sets": 3, "reps": 10 }\n    ]\n  }\n]',
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
      sessionsJson: JSON.stringify(plan.sessions || [], null, 2),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let parsedSessions = [];
    try {
      parsedSessions = JSON.parse(formData.sessionsJson);
    } catch (err) {
      alert(
        "Invalid JSON format in the Sessions box! Please check your commas and brackets.",
      );
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        duration: Number(formData.duration),
        details: formData.details,
        sessions: parsedSessions,
      };

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
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-medium cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Plan
        </button>
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
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-8 flex flex-col max-h-[90vh]">
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

            <div className="p-6 overflow-y-auto">
              <form
                id="gymPlanForm"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="e.g. Muscle Builder"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    rows="2"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-sm"
                    placeholder="Short Description of the Plan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Details
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.details}
                    onChange={(e) =>
                      setFormData({ ...formData, details: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    placeholder="Plan Details"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Workout Sessions
                  </label>
                  <textarea
                    required
                    rows="8"
                    value={formData.sessionsJson}
                    onChange={(e) =>
                      setFormData({ ...formData, sessionsJson: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs bg-slate-50"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Must be a valid JSON array of session objects.
                  </p>
                </div>
              </form>
            </div>

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
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{" "}
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
