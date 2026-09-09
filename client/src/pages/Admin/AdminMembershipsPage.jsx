import React, { useState, useEffect } from "react";
import api from "../../lib/axios.js";
import { Plus, Trash2, CreditCard, X } from "lucide-react";

const AdminMembershipsPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    maxTrainers: 1,
    details: "", // comma separated
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/memberships/plans");
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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const detailsArray = formData.details
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      await api.post("/admin/add-membership-plan", {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
        maxTrainers: Number(formData.maxTrainers),
        details: detailsArray,
      });
      setIsModalOpen(false);
      setFormData({
        name: "",
        price: "",
        duration: "",
        maxTrainers: 1,
        details: "",
      });
      fetchPlans();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add plan");
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
          onClick={() => setIsModalOpen(true)}
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
              className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-100 flex flex-col relative overflow-hidden group"
            >
              {!plan.isActive && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                  INACTIVE
                </div>
              )}

              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-black text-slate-900">
                  Rs. {plan.price}
                </span>
                <span className="text-slate-500 font-medium">
                  {" "}
                  / {plan.duration} days
                </span>
              </div>

              <div className="text-sm font-medium text-slate-700 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                Max Trainers allowed:{" "}
                <span className="text-brand-600">{plan.maxTrainers}</span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.details?.map((detail, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0"></div>
                    {detail}
                  </li>
                ))}
              </ul>

              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                {plan.isActive && (
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">
                Add Membership Plan
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
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
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Price (Rs. )
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Features / Details (comma separated)
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.details}
                  placeholder="24/7 Access, Personal Locker, Free Wi-Fi..."
                  onChange={(e) =>
                    setFormData({ ...formData, details: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50 min-w-[100px]"
                >
                  {submitting ? "Adding..." : "Add Plan"}
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
