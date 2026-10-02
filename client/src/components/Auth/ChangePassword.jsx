import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "../../lib/axios.js";
import AuthLayout from "./AuthLayout.jsx";
import FormInput from "./FormInput.jsx";

const ChangePassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post(`/auth/change-password/${token}`, { password });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to reset password. The link might be invalid or expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Choose new password"
      subtitle="Enter your new password below"
    >
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <FormInput
            id="password"
            name="password"
            type="password"
            label="New Password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm New Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 mt-4 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
        </form>
      ) : (
        <div className="rounded-lg border border-success/20 bg-success/5 p-6 text-center dark:border-success/30 dark:bg-success/10">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success mb-3" />
          <p className="text-success-800 font-medium mb-4 dark:text-success">
            Password reset successfully!
          </p>
          <Link
            to="/login"
            className="inline-flex w-full justify-center rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Go to Login
          </Link>
        </div>
      )}

      {!success && (
        <div className="mt-6 flex justify-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      )}
    </AuthLayout>
  );
};

export default ChangePassword;
