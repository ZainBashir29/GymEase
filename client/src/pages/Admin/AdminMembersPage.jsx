import React, { useState, useEffect } from "react";
import api from "../../lib/axios.js";
import { Search, Trash2, CheckCircle2, XCircle, RefreshCw, Mail, X } from "lucide-react";

const AdminMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);

  const [emailModal, setEmailModal] = useState({ open: false, member: null });
  const [newEmail, setNewEmail] = useState("");
  const [emailChanging, setEmailChanging] = useState(false);
  const [emailError, setEmailError] = useState("");

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/admin/members?includeInactive=${includeInactive}`,
      );
      setMembers(data.data || []);
    } catch (error) {
      console.error("Failed to fetch members", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [includeInactive]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this member?"))
      return;

    try {
      await api.delete(`/admin/members/delete/${id}`);
      fetchMembers();
    } catch (error) {
      console.error("Failed to delete member", error);
      alert(error.response?.data?.message || "Failed to deactivate member");
    }
  };

  const handleReactivate = async (id) => {
    if (!window.confirm("Are you sure you want to reactivate this member?"))
      return;

    try {
      await api.patch(`/admin/members/reactivate/${id}`);
      fetchMembers();
    } catch (error) {
      console.error("Failed to reactivate member", error);
      alert(error.response?.data?.message || "Failed to reactivate member");
    }
  };

  const openEmailModal = (member) => {
    setEmailModal({ open: true, member });
    setNewEmail("");
    setEmailError("");
  };

  const closeEmailModal = () => {
    setEmailModal({ open: false, member: null });
    setNewEmail("");
    setEmailError("");
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailError("");
    setEmailChanging(true);
    try {
      await api.patch(`/admin/members/change-email/${emailModal.member._id}`, {
        email: newEmail,
      });
      closeEmailModal();
      fetchMembers();
    } catch (error) {
      setEmailError(
        error.response?.data?.message || "Failed to change email address.",
      );
    } finally {
      setEmailChanging(false);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="text-slate-500 mt-1">
            Manage gym members and view their active plans.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
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
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Gym Plan
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No members found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold overflow-hidden shrink-0">
                          {member.profilePicture ? (
                            <img
                              src={member.profilePicture}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            member.fullName?.charAt(0).toUpperCase() || "M"
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {member.fullName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            @{member.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-slate-600">{member.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.membership ? (
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {member.membership.planName}
                          </p>
                          <p className="text-xs text-slate-500">
                            Expires:{" "}
                            {new Date(
                              member.membership.endDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          No Active Plan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.gymPlan ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                          {member.gymPlan.planName}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          None
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEmailModal(member)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Change Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        {member.isActive ? (
                          <button
                            onClick={() => handleDelete(member._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deactivate Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(member._id)}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Reactivate Member"
                          >
                            <RefreshCw className="w-4 h-4" />
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

      {emailModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Change Email Address</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  For <span className="font-medium text-slate-700">{emailModal.member?.fullName}</span>
                </p>
              </div>
              <button
                onClick={closeEmailModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangeEmail} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current Email
                </label>
                <input
                  type="email"
                  value={emailModal.member?.email || ""}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => { setNewEmail(e.target.value); setEmailError(""); }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="Enter new email address"
                  autoFocus
                />
              </div>

              {emailError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {emailError}
                </p>
              )}

              <p className="text-xs text-slate-400">
                The member will receive a confirmation email at their new address notifying them of this change.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEmailModal}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailChanging}
                  className="px-5 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {emailChanging ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Update Email"
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

export default AdminMembersPage;
