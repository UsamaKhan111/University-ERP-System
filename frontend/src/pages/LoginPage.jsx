import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthShell from "../components/AuthShell";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [apiError, setApiError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm({
    defaultValues: { email: "", password: "" }
  });

  const redirectTo = location.state?.from?.pathname || "/";

  const onSubmit = async (values) => {
    setApiError("");
    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const status = error.response?.status;
      if (!status && error.message?.includes("Network")) {
        const apiUrl = import.meta.env.VITE_API_URL;
        setApiError(`Cannot reach the backend at ${apiUrl}. Make sure it is running.`);
        return;
      }
      setApiError(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthShell eyebrow="Sign in" title="Login">
      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        {apiError ? (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        <label className="grid gap-1 text-sm font-medium text-ink">
          Email
          <input
            className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            type="email"
            autoComplete="email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+\.\S+$/, message: "Email must be valid" }
            })}
          />
          {errors.email ? <span className="text-xs text-red-600">{errors.email.message}</span> : null}
        </label>

        <label className="grid gap-1 text-sm font-medium text-ink">
          Password
          <input
            className="rounded border border-stone-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            type="password"
            autoComplete="current-password"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password ? <span className="text-xs text-red-600">{errors.password.message}</span> : null}
        </label>

        <button
          className="rounded bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-sm text-stone-600">
        New to the system?{" "}
        <Link className="font-medium text-brand-700 hover:text-brand-600" to="/register">
          Register
        </Link>
      </p>
    </AuthShell>
  );
};

export default LoginPage;
