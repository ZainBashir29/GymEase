import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/axios.js";
import toast from "react-hot-toast";
import { ShieldCheck, Loader2, Lock } from "lucide-react";

export default function AcceptInvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invitationData, setInvitationData] = useState(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No invitation token provided.");
      setIsLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const { data } = await api.get(`/auth/verify-invitation/${token}`);
        setInvitationData(data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Invalid or expired invitation link."
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (invitationData?.isNewUser) {
      if (password.length < 8) {
        return toast.error("Password must be at least 8 characters");
      }
      if (password !== confirmPassword) {
        return toast.error("Passwords do not match");
      }
    }

    try {
      setIsSubmitting(true);
      await api.post("/auth/accept-invitation", {
        token,
        password: invitationData?.isNewUser ? password : undefined,
      });

      toast.success("Invitation accepted successfully!");

      if (!invitationData?.isNewUser) {
        toast("Please log in again to access the admin panel.", {
          duration: 5000,
          icon: <Lock className="h-5 w-5 text-slate-700" />,
        });
      }

      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to accept invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <ShieldCheck className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">
            Invalid Invitation
          </h2>
          <p className="mb-6 text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full rounded-xl bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="mb-2 text-center text-2xl font-bold text-slate-800">
          Admin Invitation
        </h2>
        <p className="mb-6 text-center text-slate-600">
          {invitationData?.fullName
            ? `Hello ${invitationData.fullName}, you`
            : "You"}{" "}
          have been invited to become a Sub-Admin on GymEase.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-700">Email:</span>{" "}
              {invitationData?.email}
            </p>
            {!invitationData?.isNewUser && (
              <p className="mt-2 text-blue-600">
                You already have a GymEase account. Accepting this invitation
                will upgrade your existing account with sub-admin privileges.
              </p>
            )}
          </div>

          {invitationData?.isNewUser && (
            <>
              <div>
                <label 
                  htmlFor="password" 
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Set Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-blue-500"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-blue-500"
                  placeholder="Confirm your password"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Accept Invitation"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}