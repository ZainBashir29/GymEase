import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../../lib/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";
import AuthLayout from "./AuthLayout.jsx";
import FormInput from "./FormInput.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await api.post("/auth/login", formData);

      login(data.data.user);

      const role = data.data.user.role;
      if (role === "Admin") navigate("/admin/dashboard");
      else if (role === "Trainer") navigate("/trainer/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid email or password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your GymEase account">
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
          label="Email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <FormInput
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
