import React, { useState, useEffect } from "react";
import api from "../../lib/axios.js";
import { Plus, Trash2, CreditCard, X, Edit2, CheckCircle2 } from "lucide-react";

const AdminMembershipsPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    maxTrainers: 1,
    details: "", 
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/memberships/plans?includeInactive=true");
      setPlans(data.data || []);
    } catch (error) {
      console.error("Failed to fetch membership plans", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate this membership plan?",
      )
    )
      return;
    try {
      await api.delete(`/admin/delete-membership-plan/${id}`);
      fetchPlans();
    } catch (error) {
      alert("Failed to delete plan");
    }
  };

  const openAddModal = () => {
    setEditingPlanId(null);
    setFormData({
      name: "",
      price: "",
      duration: "",
      maxTrainers: 1,
      details: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlanId(plan._id);
    setFormData({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      maxTrainers: plan.maxTrainers || 1,
      details: plan.details ? plan.details.join(", ") : "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const detailsArray = formData.details
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
        maxTrainers: Number(formData.maxTrainers),
        details: detailsArray,
      };

      if (editingPlanId) {
        await api.patch(
          `/admin/update-membership-plan/${editingPlanId}`,
          payload,
        );
      } else {
        await api.post("/admin/add-membership-plan", payload);
      }

      setIsModalOpen(false);
      setEditingPlanId(null);
      setFormData({
        name: "",
        price: "",
        duration: "",
        maxTrainers: 1,
        details: "",
      });
      fetchPlans();
    } catch (error) {
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
          <h1 className="text-2xl font-bold text-slate-900">
            Membership Plans
          </h1>
          <p className="text-slate-500 mt-1">
            Manage pricing and subscription plans.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl shadow-sm">
            <p className="text-slate-500">No membership plans available.</p>
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

              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-brand-600">
                    Rs {plan.price.toLocaleString()}
                  </span>
                  <span className="text-slate-500 font-medium">
                    / {plan.duration} days
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600">
                    Up to{" "}
                    <strong className="text-slate-900">
                      {plan.maxTrainers}
                    </strong>{" "}
                    Trainers included
                  </span>
                </div>
                {plan.details?.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{detail}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(plan)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                {plan.isActive && (
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-slate-900">
                {editingPlanId
                  ? "Edit Membership Plan"
                  : "Add New Membership Plan"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  placeholder="e.g. Premium Plan"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price (Rs)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Duration (Days)
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
                  Max Trainers Allowed
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.maxTrainers}
                  onChange={(e) =>
                    setFormData({ ...formData, maxTrainers: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Plan Details / Perks
                </label>
                <textarea
                  rows="3"
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-sm"
                  placeholder="Enter perks separated by commas (e.g. 24/7 Access, Free Towels)"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Separate each perk with a comma.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 sticky bottom-0 bg-white pb-2 z-10">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingPlanId ? "Saving Changes..." : "Adding Plan..."}
                    </>
                  ) : editingPlanId ? (
                    "Save Changes"
                  ) : (
                    "Add Plan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembershipsPage;
