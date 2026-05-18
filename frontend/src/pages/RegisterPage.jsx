import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";

const roles = ["student", "teacher", "admin"];

const RegisterPage = () => {
  const [apiError, setApiError] = useState("");
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm({
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      role: "student"
    }
  });

  const onSubmit = async (values) => {
    setApiError("");

    try {
      await registerUser(values);
      navigate("/", { replace: true });
    } catch (error) {
      setApiError(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthShell eyebrow="Create account" title="Register">
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        {apiError ? (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        <label className="grid gap-1 text-sm font-medium text-ink">
          Full name
          <input
            className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            type="text"
            autoComplete="name"
            {...register("fullName", {
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Full name must be at least 2 characters"
              }
            })}
          />
          {errors.fullName ? <span className="text-xs text-red-600">{errors.fullName.message}</span> : null}
        </label>

        <label className="grid gap-1 text-sm font-medium text-ink">
          Email
          <input
            className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            type="email"
            autoComplete="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Email must be valid"
              }
            })}
          />
          {errors.email ? <span className="text-xs text-red-600">{errors.email.message}</span> : null}
        </label>

        <label className="grid gap-1 text-sm font-medium text-ink">
          Password
          <input
            className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            type="password"
            autoComplete="new-password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters"
              }
            })}
          />
          {errors.password ? <span className="text-xs text-red-600">{errors.password.message}</span> : null}
        </label>

        <label className="grid gap-1 text-sm font-medium text-ink">
          Role
          <select
            className="rounded border border-stone-300 px-3 py-2 text-sm capitalize outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            {...register("role", { required: "Role is required" })}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {errors.role ? <span className="text-xs text-red-600">{errors.role.message}</span> : null}
        </label>

        <button
          className="rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-sm text-stone-600">
        Already registered?{" "}
        <Link className="font-medium text-brand-700 hover:text-brand-600" to="/login">
          Login
        </Link>
      </p>
    </AuthShell>
  );
};

export default RegisterPage;
