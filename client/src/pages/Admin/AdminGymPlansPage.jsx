import React, { useState, useEffect } from "react";
import api from "../../lib/axios.js";
import { Plus, Trash2, Edit2, Dumbbell, Clock } from "lucide-react";

const AdminGymPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    details: "",
    duration: 30,
    sessions: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/gym-plans");
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

  const openAddModal = () => {
    setEditingPlanId(null);
    setFormData({
      name: "",
      description: "",
      details: "",
      duration: 30,
      sessions: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlanId(plan._id);
    setFormData({
      name: plan.name,
      description: plan.description,
      details: plan.details ? plan.details.join(", ") : "",
      duration: plan.duration,
      sessions: plan.sessions || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const detailsArray = formData.details
        .split(",")
        .map((detail) => detail.trim())
        .filter((detail) => Boolean(detail));

      const payload = {
        ...formData,
        details: detailsArray,
        duration: Number(formData.duration),
      };

      if (editingPlanId) {
        await api.patch(`/admin/update-gym-plan/${editingPlanId}`, payload);
      } else {
        await api.post("/admin/add-gym-plan", payload);
      }

      setIsModalOpen(false);
      setEditingPlanId(null);
      fetchPlans();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this gym plan?"))
      return;
    try {
      await api.delete(`/admin/delete-gym-plan/${id}`);
      fetchPlans();
    } catch (error) {
      alert("Failed to delete plan");
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
              className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 flex flex-col relative overflow-hidden group"
            >
              {!plan.isActive && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                  INACTIVE
                </div>
              )}

              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Dumbbell className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-1">
                {plan.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-brand-500" />
                  {plan.duration} Days
                </div>
                <div className="w-px h-4 bg-slate-200"></div>
                <div className="font-medium">
                  {plan.sessions?.length || 0} Sessions
                </div>
              </div>

              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                {plan.isActive && (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 cursor-pointer px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deactivate
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminGymPlansPage;
