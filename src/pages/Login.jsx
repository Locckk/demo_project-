import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: localStorage.getItem("srms_remember") || "",
    password: "",
    remember: Boolean(localStorage.getItem("srms_remember")),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const update = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="row g-0 min-vh-100">
      {/* Left — brand panel with the garment rail drawn in CSS */}
      <div className="col-lg-6 d-none d-lg-flex flex-column justify-content-between login-panel p-5">
        <div className="d-flex align-items-center gap-3">
          <span className="srms-brand-mark">SR</span>
          <span className="h5 mb-0 text-white">Suit Rental</span>
        </div>

        <div style={{ maxWidth: 460 }}>
          <div className="label-caps text-brass">Inventory · Bookings · Rentals · Returns</div>
          <h1 className="display-5 fw-bold text-white mt-3 lh-1">
            Every suit accounted for, every day it's out.
          </h1>
          <p className="mt-3 mb-0" style={{ color: "rgba(246,245,241,.6)" }}>
            Track the rail, the customer and the return date from one place.
          </p>
        </div>

        <div aria-hidden="true">
          <div className="login-rail" />
          <div className="d-flex gap-4">
            {[64, 88, 72, 96, 80, 68].map((h, i) => (
              <div className="d-flex flex-column align-items-center" key={i}>
                <span className="login-hanger" />
                <span className="login-suit" style={{ height: h }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — the form */}
      <div className="col-lg-6 d-flex align-items-center justify-content-center px-4 py-5">
        <div style={{ width: "100%", maxWidth: 360 }}>
          <div className="d-flex align-items-center gap-3 mb-4 d-lg-none">
            <span
              className="srms-brand-mark"
              style={{ background: "var(--srms-ink)", color: "var(--srms-brass)" }}
            >
              SR
            </span>
            <span className="h5 mb-0">Suit Rental</span>
          </div>

          <div className="label-caps text-brass">Staff access</div>
          <h2 className="h3 mt-2 mb-1">Sign in</h2>
          <p className="text-secondary">Use the account your administrator gave you.</p>

          <div className="chalk-rule my-4" />

          {error && (
            <div className="alert alert-danger d-flex align-items-start gap-2 py-2">
              <FiAlertCircle size={16} className="flex-shrink-0 mt-1" />
              <span className="small mb-0">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label label-caps mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-control"
                required
                autoComplete="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@srms.com"
              />
            </div>

            <div className="mb-3">
              <label className="form-label label-caps mb-1" htmlFor="password">
                Password
              </label>
              <div className="input-group">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={update("password")}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="remember"
                  checked={form.remember}
                  onChange={update("remember")}
                />
                <label className="form-check-label small" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <button type="button" className="btn btn-link btn-sm p-0">
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo hint — remove before submitting the project */}
          <div className="border border-2 border-dashed rounded p-3 mt-4">
            <div className="label-caps">Demo accounts</div>
            <p className="mono small mb-0 mt-2">
              admin@srms.com / admin123
              <br />
              employee@srms.com / staff123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
