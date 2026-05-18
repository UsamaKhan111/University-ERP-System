import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const silentLogin = async () => {
      try {
        // Perform an immediate login and redirect without any UI flicker
        await login({ email: "admin@example.com", password: "demo" });
        navigate("/", { replace: true });
      } catch (err) {
        // Caught net::ERR_CONNECTION_REFUSED
        console.error("Backend unreachable. Ensure server is running on port 5000.", err);
        setConnectionError(true);
      }
    };
    silentLogin();
  }, [login, navigate]);

  // Show troubleshooting guide if the backend connection fails
  if (connectionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
        <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-8 shadow-xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-stone-900">Backend Connection Refused</h1>
          <p className="mt-2 text-stone-600">The ERP system cannot reach the API at <code className="text-red-600 font-bold">localhost:5000</code>.</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-lg bg-stone-900 p-4 text-xs font-mono text-stone-300">
              <p># Run this in your /backend folder:</p>
              <p className="text-brand-400">npm run dev</p>
            </div>
            <button onClick={() => window.location.reload()} className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
              I've started the server, Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoginPage;
