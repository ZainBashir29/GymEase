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
  const [emailSuggestion, setEmailSuggestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    if (e.target.name === "email") setEmailSuggestion("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePicture(file);
  };

  const getFieldError = (name, value, currentFormData) => {
    switch (name) {
      case "fullName":
        return !value.trim() ? "Full name is required" : "";
      case "username":
        if (!value.trim()) return "Username is required";
        if (!/^[a-z0-9_]+$/.test(value))
          return "Username can only contain lowercase letters, numbers, and underscores";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (/[A-Z]/.test(value)) return "Email must be in lowercase only";
        if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value))
          return "Please enter a valid email address";
        return "";
      case "age":
        if (!value) return "Age is required";
        if (Number(value) < minimumAge)
          return `You must be at least ${minimumAge} years old`;
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value))
          return "Password must contain at least one letter and one number";
        return "";
      case "confirmPassword":
        if (value !== currentFormData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const suggestEmailCorrection = (email) => {
    if (!email || !email.includes("@")) return "";
    const [local, domain] = email.split("@");
    if (!domain) return "";

    const commonDomains = {
      "gmail.com": [
        "gnail.com",
        "gamil.com",
        "gmal.com",
        "gmil.com",
        "gmail.co",
        "gmail.con",
      ],
      "yahoo.com": ["yaho.com", "yahooo.com", "yaboo.com"],
      "outlook.com": ["outlok.com", "outloook.com", "outllok.com"],
      "hotmail.com": ["hotmal.com", "hotmai.com", "hotmial.com"],
    };

    for (const [correctDomain, typos] of Object.entries(commonDomains)) {
      if (typos.includes(domain.toLowerCase())) {
        return `${local}@${correctDomain}`;
      }
    }
    return "";
  };

  const handleBlur = (e) => {
    const error = getFieldError(e.target.name, e.target.value, formData);
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: error }));

    if (e.target.name === "email" && !error) {
      setEmailSuggestion(suggestEmailCorrection(e.target.value));
    }
  };

  const validate = () => {
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = getFieldError(key, formData[key], formData);
      if (error) errors[key] = error;
    });

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
            onClick={() =>
              navigate("/login", { state: { redirectTo: "/pricing" } })
            }
            className="mt-6 w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 cursor-pointer"
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
          label="Full Name"
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. John Doe"
          required
          error={fieldErrors.fullName}
        />

        <FormInput
          label="Username"
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. johndoe123"
          required
          error={fieldErrors.username}
        />

        <div>
          <FormInput
            label="Email Address"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. john@example.com"
            required
            error={fieldErrors.email}
          />
          {emailSuggestion && !fieldErrors.email && (
            <p className="mt-1 text-sm text-yellow-600">
              Did you mean{" "}
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, email: emailSuggestion }));
                  setEmailSuggestion("");
                }}
                className="font-bold underline hover:text-amber-700 cursor-pointer"
              >
                {emailSuggestion}
              </button>
              ?
            </p>
          )}
        </div>

        <FormInput
          label="Age"
          id="age"
          name="age"
          type="number"
          min="16"
          max="100"
          value={formData.age}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g. 24"
          required
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
          label="Password"
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Minimum 8 characters"
          required
          error={fieldErrors.password}
        />

        <FormInput
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="••••••••"
          required
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
