import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/axios.js";
import { Loader2, Plus, ShieldAlert, Edit, Trash2, Mail } from "lucide-react";
import Modal from "../../components/UI/Modal.jsx";
import toast from "react-hot-toast";

const availablePermissions = [
  "manage_members",
  "manage_trainers",
  "manage_gym_plans",
  "manage_membership_plans",
  "manage_products",
  "manage_orders",
  "manage_store",
  "manage_messages",
];

export default function AdminSubAdminsPage() {
  const { isSystemAdmin, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subAdmins, setSubAdmins] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: "",
    fullName: "",
    permissions: [],
  });
  const [editPermissions, setEditPermissions] = useState([]);

  useEffect(() => {
    if (isSystemAdmin) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [isSystemAdmin]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get("/admin/sub-admins");
      setSubAdmins(data.data.subAdmins || []);
      setPendingInvitations(data.data.pendingInvitations || []);
    } catch (error) {
      toast.error("Failed to fetch sub-admins");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (inviteForm.permissions.length === 0) {
      return toast.error("Select at least one permission");
    }

    try {
      setIsSubmitting(true);
      await api.post("/admin/sub-admins/invite", inviteForm);
      toast.success("Invitation sent successfully");
      setIsInviteModalOpen(false);
      setInviteForm({ email: "", fullName: "", permissions: [] });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPermissions = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.patch(`/admin/sub-admins/${selectedItem._id}/permissions`, {
        permissions: editPermissions,
      });
      toast.success("Permissions updated");
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update permissions",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    try {
      setIsSubmitting(true);
      const id =
        selectedItem.type === "active" ? selectedItem._id : selectedItem._id;

      await api.delete(`/admin/sub-admins/revoke/${id}`);
      toast.success("Access revoked successfully");
      setIsRevokeModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to revoke access");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (perm, currentList, setList) => {
    if (currentList.includes(perm)) {
      setList(currentList.filter((p) => p !== perm));
    } else {
      setList([...currentList, perm]);
    }
  };

  if (!isSystemAdmin && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
          <p className="text-slate-600">
            Only the System Admin can view this page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-12 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sub-Admins</h1>
          <p className="text-slate-600">Manage admin access and permissions</p>
        </div>
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-medium text-white transition-colors hover:bg-brand-700 cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Invite Sub-Admin
        </button>
      </div>

      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
            <h2 className="font-semibold text-slate-800">Active Sub-Admins</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Permissions</th>
                  <th className="px-6 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subAdmins.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No active sub-admins found
                    </td>
                  </tr>
                ) : (
                  subAdmins.map((admin) => (
                    <tr key={admin._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {admin.fullName}
                        </div>
                        <div className="text-slate-500">{admin.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.map((p) => (
                            <span
                              key={p}
                              className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                            >
                              {p.replace("manage_", "")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedItem({ ...admin, type: "active" });
                            setEditPermissions(admin.permissions || []);
                            setIsEditModalOpen(true);
                          }}
                          className="mr-3 text-slate-400 hover:text-blue-600"
                          title="Edit Permissions"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {admin._id !== user?._id && (
                          <button
                            onClick={() => {
                              setSelectedItem({ ...admin, type: "active" });
                              setIsRevokeModalOpen(true);
                            }}
                            className="text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Revoke Access"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
            <h2 className="font-semibold text-slate-800">
              Pending Invitations
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Permissions</th>
                  <th className="px-6 py-3 font-semibold">Expires</th>
                  <th className="px-6 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingInvitations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No pending invitations
                    </td>
                  </tr>
                ) : (
                  pendingInvitations.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-800">
                            {inv.email}
                          </span>
                        </div>
                        {inv.isNewUser ? (
                          <span className="text-xs text-slate-500">
                            New User
                          </span>
                        ) : (
                          <span className="text-xs text-blue-600">
                            Existing User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {inv.permissions.map((p) => (
                            <span
                              key={p}
                              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                            >
                              {p.replace("manage_", "")}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(inv.invitationExpiry).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedItem({ ...inv, type: "pending" });
                            setIsRevokeModalOpen(true);
                          }}
                          className="text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Revoke Invitation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isInviteModalOpen && (
        <Modal
          title="Invite Sub-Admin"
          onClose={() => setIsInviteModalOpen(false)}
        >
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, email: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-blue-500"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Full Name{" "}
                <span className="text-xs font-normal text-slate-500">
                  (Required for new users)
                </span>
              </label>
              <input
                type="text"
                value={inviteForm.fullName}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, fullName: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Permissions
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availablePermissions.map((perm) => (
                  <label
                    key={perm}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={inviteForm.permissions.includes(perm)}
                      onChange={() =>
                        togglePermission(perm, inviteForm.permissions, (p) =>
                          setInviteForm({ ...inviteForm, permissions: p }),
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {perm
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Invitation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isEditModalOpen && (
        <Modal
          title={`Edit Permissions: ${selectedItem?.fullName}`}
          onClose={() => setIsEditModalOpen(false)}
        >
          <form onSubmit={handleEditPermissions} className="space-y-4">
            <div>
              <div className="grid grid-cols-2 gap-2">
                {availablePermissions.map((perm) => (
                  <label
                    key={perm}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={editPermissions.includes(perm)}
                      onChange={() =>
                        togglePermission(
                          perm,
                          editPermissions,
                          setEditPermissions,
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {perm
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isRevokeModalOpen && (
        <Modal
          title="Revoke Access"
          onClose={() => setIsRevokeModalOpen(false)}
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-red-50 p-4 text-red-800">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">
                    Confirm Revocation
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Are you sure you want to revoke{" "}
                    {selectedItem?.type === "active"
                      ? "access for"
                      : "the invitation for"}{" "}
                    <span className="font-semibold">{selectedItem?.email}</span>
                    ?
                  </p>
                  {selectedItem?.type === "active" && (
                    <p className="mt-2 text-xs text-red-600">
                      If this user was an existing member or trainer, their
                      original role will be restored. Otherwise, their account
                      will be deactivated.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRevokeModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Revoke Access
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
