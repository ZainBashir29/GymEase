import { useAuth } from "../../context/AuthContext.jsx";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/axios.js";
import {
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  X,
  Edit2,
  Upload,
  User,
  BarChart2,
  ShieldAlert,
  PowerOff,
} from "lucide-react";
import FormInput from "../../components/Auth/FormInput.jsx";

const AdminTrainersPage = () => {
  const { hasPermission } = useAuth();
  if (!hasPermission("manage_trainers")) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center p-8">
        <div className="text-center">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
          <p className="text-slate-600">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainerId, setEditingTrainerId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
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

  const handleDeactivate = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to deactivate this trainer? They cannot have upcoming sessions.",
      )
    )
      return;

    try {
      await api.patch(`/admin/trainers/deactivate/${id}`);
      fetchTrainers();
    } catch (error) {
      console.error("Failed to deactivate trainer", error);
      alert(error.response?.data?.message || "Failed to deactivate trainer");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this trainer?"))
      return;

    try {
      await api.delete(`/admin/trainers/delete/${id}`);
      fetchTrainers();
    } catch (error) {
      console.error("Failed to delete trainer", error);
      alert(error.response?.data?.message || "Failed to delete trainer");
    }
  };

  const handleReactivate = async (id) => {
    if (!window.confirm("Are you sure you want to reactivate this trainer?"))
      return;

    try {
      await api.patch(`/admin/trainers/reactivate/${id}`);
      fetchTrainers();
    } catch (error) {
      console.error("Failed to reactivate trainer", error);
      alert(error.response?.data?.message || "Failed to reactivate trainer");
    }
  };

  const openAddModal = () => {
    setEditingTrainerId(null);
    setFormData({
      fullName: "",
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
      email: trainer.email,
      password: "",
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
        await api.post("/admin/trainers/add", formData);
      }

      setIsModalOpen(false);
      setEditingTrainerId(null);
      setFormData({
        fullName: "",
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trainers</h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            Manage gym trainers and their specialties.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm font-medium cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Trainer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden dark:bg-slate-900 dark:ring-slate-800">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Show Inactive
            </span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Trainer
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Specialty
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 text-right dark:border-slate-800">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                    className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No trainers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTrainers.map((trainer) => (
                  <tr
                    key={trainer._id}
                    className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 overflow-hidden dark:bg-brand-900/30 dark:text-brand-400">
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
                          <p className="font-bold text-slate-900 dark:text-white">
                            {trainer.fullName}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {trainer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {trainer.expertise}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {trainer.isActive ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium dark:text-slate-500">
                          <XCircle className="w-4 h-4" />
                          <span>Inactive</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/trainers/performance/${trainer._id}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer inline-flex items-center dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                          title="View Performance"
                        >
                          <BarChart2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(trainer)}
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer dark:hover:bg-brand-900/30 dark:hover:text-brand-400"
                          title="Edit Trainer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {trainer.isActive ? (
                          <>
                            <button
                              onClick={() => handleDeactivate(trainer._id)}
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer dark:hover:bg-orange-900/30 dark:hover:text-orange-400"
                              title="Inactive Trainer"
                            >
                              <PowerOff className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(trainer._id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer dark:hover:bg-red-900/30 dark:hover:text-red-400"
                              title="Delete Trainer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleReactivate(trainer._id)}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer dark:hover:bg-green-900/30 dark:hover:text-green-400"
                              title="Reactivate Trainer"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(trainer._id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer dark:hover:bg-red-900/30 dark:hover:text-red-400"
                              title="Delete Trainer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md my-8 dark:bg-slate-900">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10 dark:bg-slate-900 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTrainerId ? "Edit Trainer" : "Add New Trainer"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                  Full Name <span className="text-danger ml-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                  Email <span className="text-danger ml-1">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  placeholder="e.g. jane@gymease.site"
                />
              </div>

              {!editingTrainerId && (
                <FormInput
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  required={!editingTrainerId}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                />
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                  Expertise <span className="text-danger ml-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.expertise}
                  onChange={(e) =>
                    setFormData({ ...formData, expertise: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  placeholder="e.g. Weightlifting, HIIT Expert, Fat Loss"
                />
              </div>

              {editingTrainerId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                    Profile Picture (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
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
                          <div className="flex text-sm text-slate-600 dark:text-slate-400">
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

              <div className="pt-4 border-t border-slate-100 sticky bottom-0 bg-white pb-2 z-10 dark:bg-slate-900 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
