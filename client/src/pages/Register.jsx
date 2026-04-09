import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css"
import Toast from "../components/shared/Toast";

const Register = () => {
  const { register } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError]     = useState(null);
  const [toast, setToast]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    setError(null);
    try {
      await register(form);
      setToast({ message: "Registration successful! Please login.", type: "success" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Spinner = () => (
    <span style={{
      width: "14px", height: "14px",
      border: "2px solid rgba(255,255,255,.3)", borderTopColor: "white",
      borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block"
    }} />
  );

  return (
    <div className="auth-container" data-theme={theme}>
      <div className="auth-card">

        <div className="auth-brand">
          <div className="auth-brand-icon">🍽️</div>
          <div>
            <div className="auth-brand-name">PICT Canteen</div>
            <div className="auth-brand-sub">Pune Institute of Computer Technology</div>
          </div>
        </div>

        <h2>Create account</h2>
        <p className="auth-subtitle">Join PICT Canteen — it's free</p>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input required name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
          </div>

          <div className="input-group">
            <span className="input-icon">✉️</span>
            <input required name="email" type="email" placeholder="College email address"
              value={form.email} onChange={handleChange} autoComplete="email" />
          </div>

          <div className="input-group" style={{ position: "relative" }}>
            <span className="input-icon">🔒</span>
            <input required name="password" type={showPass ? "text" : "password"}
              placeholder="Create a password (min 6 chars)"
              value={form.password} onChange={handleChange}
              autoComplete="new-password" style={{ paddingRight: "42px" }} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", fontSize: "16px",
                color: "var(--gray-400)", padding: 0 }}>
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          
          <div className="auth-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}><Spinner /> Creating account…</span>
                : "Create Account →"
              }
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
};

export default Register;