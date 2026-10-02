import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import api from "../../lib/axios.js";
import AuthLayout from "./AuthLayout.jsx";
import FormInput from "./FormInput.jsx";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset email. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email to receive a password reset link"
    >
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <FormInput
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="e.g. john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 mt-4 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      ) : (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-6 text-center dark:border-brand-800 dark:bg-brand-900/30">
          <p className="text-brand-800 font-medium mb-4 dark:text-brand-300">
            If an account with {email} exists, we've sent a password reset link.
          </p>
          <p className="text-brand-600 text-sm dark:text-brand-400">
            Please check your email inbox and spam folder.
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
