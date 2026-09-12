import React, { useState, useEffect } from "react";
import api from "../../lib/axios.js";
import {
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus,
  X,
  Edit2,
  Upload,
  User,
} from "lucide-react";

const AdminTrainersPage = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainerId, setEditingTrainerId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    expertise: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/trainers?includeInactive=${includeInactive}`,
      );
      setTrainers(data.data || []);
    } catch (error) {
      console.error("Failed to fetch trainers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [includeInactive]);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate this trainer? They cannot have upcoming sessions.",
      )
    )
      return;

    try {
      await api.delete(`/admin/trainers/delete/${id}`);
      fetchTrainers();
    } catch (error) {
      console.error("Failed to delete trainer", error);
      alert(error.response?.data?.message || "Failed to deactivate trainer");
    }
  };

  const openAddModal = () => {
    setEditingTrainerId(null);
    setFormData({
      fullName: "",
      username: "",
      email: "",
      password: "",
      expertise: "",
    });
    setProfilePicture(null);
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (trainer) => {
    setEditingTrainerId(trainer._id);
    setFormData({
      fullName: trainer.fullName,
      username: trainer.username || "",
      email: trainer.email,
      password: "", // Password cannot be edited via this route currently
      expertise: trainer.expertise,
    });
    setProfilePicture(null);
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (editingTrainerId) {
        // Edit Trainer (Uses multipart/form-data because it accepts profilePicture)
        const form = new FormData();
        form.append("fullName", formData.fullName);
        form.append("email", formData.email);
        form.append("expertise", formData.expertise);
        if (profilePicture) {
          form.append("profilePicture", profilePicture);
        }

        await api.patch(`/admin/trainers/update/${editingTrainerId}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Add Trainer (Uses JSON for basic fields currently based on old implementation)
        // If the backend addTrainer supports profilePicture, we could use FormData too, but sticking to what was there:
        await api.post("/admin/trainers/add", formData);
      }

      setIsModalOpen(false);
      setEditingTrainerId(null);
      setFormData({
        fullName: "",
        username: "",
        email: "",
        password: "",
        expertise: "",
      });
      setProfilePicture(null);
      fetchTrainers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          (editingTrainerId
            ? "Failed to update trainer"
            : "Failed to add trainer"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTrainers = trainers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.expertise.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trainers</h1>
          <p className="text-slate-500 mt-1">
            Manage gym trainers and their specialties.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Trainer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Show Inactive
            </span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Trainer
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Specialty
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredTrainers.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No trainers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTrainers.map((trainer) => (
                  <tr
                    key={trainer._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 overflow-hidden">
                          {trainer.profilePicture ? (
                            <img
                              src={trainer.profilePicture}
                              alt={trainer.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            trainer.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {trainer.fullName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {trainer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {trainer.expertise}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trainer.isActive ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                          <XCircle className="w-4 h-4" />
                          <span>Inactive</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(trainer)}
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit Trainer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {trainer.isActive && (
                          <button
                            onClick={() => handleDelete(trainer._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deactivate Trainer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTrainerId ? "Edit Trainer" : "Add New Trainer"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. John Doe"
                />
              </div>

              {!editingTrainerId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required={!editingTrainerId}
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g. johndoe"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. john@example.com"
                />
              </div>

              {!editingTrainerId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required={!editingTrainerId}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Expertise / Specialty
                </label>
                <input
                  type="text"
                  required
                  value={formData.expertise}
                  onChange={(e) =>
                    setFormData({ ...formData, expertise: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. Weightlifting, Yoga, Calisthenics"
                />
              </div>

              {editingTrainerId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Profile Picture (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePicture(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-1 text-center">
                      {profilePicture ? (
                        <div className="text-brand-600 font-medium break-all">
                          {profilePicture.name}
                        </div>
                      ) : (
                        <>
                          <User className="mx-auto h-12 w-12 text-slate-400" />
                          <div className="flex text-sm text-slate-600">
                            <span className="relative cursor-pointer rounded-md bg-transparent font-medium text-brand-600 focus-within:outline-none hover:text-brand-500">
                              Upload new picture
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 sticky bottom-0 bg-white pb-2 z-10">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingTrainerId ? "Updating..." : "Adding..."}
                    </>
                  ) : editingTrainerId ? (
                    "Update Trainer"
                  ) : (
                    "Add Trainer"
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

export default AdminTrainersPage;
