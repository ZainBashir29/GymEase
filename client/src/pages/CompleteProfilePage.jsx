import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import api from "../lib/axios.js";
import AuthLayout from "../components/Auth/AuthLayout.jsx";
import FormInput from "../components/Auth/FormInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const MIN_AGE = 13;

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ username: "", age: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errors = {};

    if (!formData.username.trim()) errors.username = "Username is required";

    if (!formData.age) {
      errors.age = "Age is required";
    } else if (Number(formData.age) < MIN_AGE) {
      errors.age = `You must be at least ${MIN_AGE} years old`;
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
      const { data } = await api.post("/auth/complete-profile", {
        username: formData.username.trim(),
        age: Number(formData.age),
      });

      login(data.data);

      setIsSuccess(true);

      setTimeout(() => {
        navigate("/member/dashboard");
      }, 1500);
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Something went wrong while saving your profile. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Profile Complete!"
        subtitle="You're all set to use GymEase."
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
            <CheckCircle2 className="h-7 w-7 text-brand-600" strokeWidth={2} />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Taking you to your dashboard...
          </p>
          <Loader2 className="mt-4 h-5 w-5 animate-spin text-brand-600" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Almost there!"
      subtitle="Please provide a username and your age to finish setting up your account."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
            {serverError}
          </div>
        )}

        <FormInput
          id="username"
          name="username"
          type="text"
          label="Choose a Username"
          placeholder="johndoe123"
          value={formData.username}
          onChange={handleChange}
          error={fieldErrors.username}
        />

        <FormInput
          id="age"
          name="age"
          type="number"
          label="Your Age"
          placeholder="25"
          min={MIN_AGE}
          value={formData.age}
          onChange={handleChange}
          error={fieldErrors.age}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Saving..." : "Complete Profile"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default CompleteProfilePage;
