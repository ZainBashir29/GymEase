import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  User,
  Mail,
  Shield,
  AlertTriangle,
  LogOut,
  Settings,
  Camera,
} from "lucide-react";
import DashboardLayout from "../../components/Dashboard/DashboardLayout.jsx";
import {
  LayoutDashboard,
  Dumbbell,
  CreditCard,
  ShoppingBag,
  MessageCircle,
  Package,
} from "lucide-react";

const MEMBER_NAV_ITEMS = [
  {
    label: "Dashboard",
    to: "/member/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { label: "Gym Plans", to: "/member/plans", icon: Dumbbell },
  { label: "Membership", to: "/member/membership", icon: CreditCard },
  { label: "Store", to: "/store", icon: ShoppingBag },
  { label: "Orders", to: "/member/orders", icon: Package },
  { label: "Settings", to: "/member/settings", icon: Settings },
];

const MemberSettingsPage = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      if (fullName !== user?.fullName) {
        await api.patch("/auth/member/update/full-name", { fullName });
      }
      if (username !== user?.username) {
        await api.patch("/auth/member/update/username", { username });
      }
      if (email !== user?.email) {
        await api.patch("/auth/member/update/email", { email });
      }

      setUser({ ...user, fullName, username, email });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsUpdatingPassword(true);
    setMessage({ type: "", text: "" });

    try {
      await api.patch("/auth/member/change/password", {
        oldPassword,
        newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setMessage({ type: "success", text: "Password changed successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to change password.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    setIsUploadingPic(true);
    setMessage({ type: "", text: "" });

    try {
      const { data } = await api.patch(
        "/auth/member/change/profile-picture",
        formData,
      );
      login({ ...user, profilePicture: data.data.profilePicture });
      setMessage({
        type: "success",
        text: "Profile picture updated successfully!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to update profile picture.",
      });
    } finally {
      setIsUploadingPic(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.prompt(
      "Are you sure you want to delete your account? This action is irreversible. Type 'DELETE' to confirm.",
    );
    if (confirm === "DELETE") {
      setIsDeleting(true);
      try {
        await api.delete("/auth/member/delete");
        await logout();
        navigate("/register");
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete account.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <DashboardLayout navItems={MEMBER_NAV_ITEMS}>
      <div className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">
          Account Settings
        </h1>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border ${message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-slate-50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-3xl font-bold border-4 border-slate-50">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() = className="cursor-pointer"> fileInputRef.current?.click()}
                disabled={isUploadingPic}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-slate-200 shadow-sm text-slate-600 hover:text-brand-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePictureUpload}
                accept="image/*"
                className="hidden cursor-pointer"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Profile Picture
              </h3>
              <p className="text-sm text-slate-500 mb-3">
                Upload a new avatar. Larger images will be resized.
              </p>
              <button
                onClick={() = className="cursor-pointer"> fileInputRef.current?.click()}
                disabled={isUploadingPic}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
              >
                {isUploadingPic ? "Uploading..." : "Upload New Picture"}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-600" />
              Profile Information
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-600" />
              Change Password
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-red-50 rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-red-200">
            <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-red-600 mb-4">
              Permanently delete your account and all of your data. This action
              cannot be undone. You will lose access to all your memberships,
              gym plans, and order history.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="px-6 py-2.5 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberSettingsPage;
