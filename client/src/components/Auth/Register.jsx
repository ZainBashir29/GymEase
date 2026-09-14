import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import api from "../../lib/axios.js";
import AuthLayout from "./AuthLayout.jsx";
import FormInput from "./FormInput.jsx";
import GoogleAuthButton from "./GoogleAuthButton.jsx";

const minimumAge = 13;

const initialForm = {
  fullName: "",
  username: "",
  email: "",
  age: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePicture(file);
  };

  const validate = () => {
    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.email.trim()) errors.email = "Email is required";

    if (!formData.age) {
      errors.age = "Age is required";
    } else if (Number(formData.age) < minimumAge) {
      errors.age = `You must be at least ${minimumAge} years old`;
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("username", formData.username);
      payload.append("email", formData.email);
      payload.append("age", Number(formData.age));
      payload.append("password", formData.password);

      if (profilePicture) {
        payload.append("profilePicture", profilePicture);
      }

      await api.post("/auth/member/register", payload);
      setIsSuccess(true);
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Account created"
        subtitle="Your GymEase account is ready"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
            <CheckCircle2 className="h-7 w-7 text-brand-600" strokeWidth={2} />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Log in with your new account to purchase a membership and get
            started.
          </p>
          <button
            onClick={() = className="cursor-pointer">
              navigate("/login", { state: { redirectTo: "/pricing" } })
            }
            className="mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Log in to continue
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start your GymEase membership today"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <GoogleAuthButton label="Sign up with Google" />
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="mx-4 shrink-0 text-xs text-slate-400">
            OR CONTINUE WITH EMAIL
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {serverError && (
          <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {serverError}
          </div>
        )}

        <FormInput
          id="fullName"
          name="fullName"
          type="text"
          label="Full Name"
          placeholder="Your Name"
          value={formData.fullName}
          onChange={handleChange}
          error={fieldErrors.fullName}
        />

        <FormInput
          id="username"
          name="username"
          type="text"
          label="Username"
          placeholder="username"
          value={formData.username}
          onChange={handleChange}
          error={fieldErrors.username}
        />

        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />

        <FormInput
          id="age"
          name="age"
          type="number"
          label="Age"
          placeholder="20"
          min={minimumAge}
          value={formData.age}
          onChange={handleChange}
          error={fieldErrors.age}
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Profile Picture (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
          />
        </div>

        <FormInput
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
          error={fieldErrors.password}
        />

        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={fieldErrors.confirmPassword}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
