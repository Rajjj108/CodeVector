import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";
import GoogleLoginButton from "../components/GoogleLoginButton";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]         = useState({ email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Note: redirect if already logged in is handled by RootRedirect in App.jsx

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      login(res.data.user);        // update AuthContext — cookie is set by server
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Too many login attempts. Please wait 15 minutes and try again.");
      } else {
        setError(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .lp-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            180deg,
            #0d0a2e 0%,
            #0c0926 40%,
            #0a0820 70%,
            #090719 100%
          );
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 24px 16px;
        }

        /* Wide flat top-edge glow — not a circle, a horizontal band */
        .lp-glow-orb {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 55vh;
          background: linear-gradient(
            180deg,
            rgba(90, 50, 255, 0.72) 0%,
            rgba(75, 40, 230, 0.52) 15%,
            rgba(60, 30, 200, 0.32) 35%,
            rgba(40, 20, 160, 0.14) 60%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 0;
          animation: lp-glow-pulse 4s ease-in-out infinite;
          filter: blur(0px);
          transform-origin: top center;
        }
        @keyframes lp-glow-pulse {
          0%, 100% { opacity: 0.88; transform: scaleY(1); }
          50%       { opacity: 1;    transform: scaleY(1.06); }
        }

        /* Card */
        .lp-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px 36px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 0 40px 80px rgba(0,0,0,0.5);
          animation: lp-fadeup 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes lp-fadeup {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Card heading */
        .lp-heading {
          font-size: 26px;
          font-weight: 700;
          color: #f0f0ff;
          text-align: center;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
          font-family: 'Inter', sans-serif;
        }

        .lp-subheading {
          font-size: 13.5px;
          color: rgba(160, 160, 200, 0.6);
          text-align: center;
          margin: 0 0 28px;
          font-weight: 400;
          line-height: 1.5;
        }

        /* Google button wrapper */
        .lp-google-wrap {
          margin-bottom: 20px;
          animation: lp-fadeup 0.55s 0.08s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* OR divider */
        .lp-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 20px;
          animation: lp-fadeup 0.55s 0.14s cubic-bezier(0.22,1,0.36,1) both;
        }
        .lp-divider::before,
        .lp-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .lp-divider span {
          font-size: 10px;
          letter-spacing: 0.22em;
          color: rgba(160,160,200,0.35);
          font-family: 'Inter', monospace;
          white-space: nowrap;
          font-weight: 500;
        }

        /* Error box */
        .lp-error {
          background: rgba(244,63,94,0.1);
          border: 1px solid rgba(244,63,94,0.25);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 12.5px;
          color: #fb7185;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: shake 0.4s ease;
        }
        @keyframes shake {
          0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)}
        }

        /* Form */
        .lp-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: lp-fadeup 0.55s 0.18s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* Field group */
        .lp-field {}

        .lp-field-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 7px;
        }

        .lp-label {
          font-size: 13px;
          font-weight: 500;
          color: rgba(220,220,240,0.85);
          letter-spacing: 0.01em;
        }

        .lp-forgot {
          font-size: 11.5px;
          color: rgba(130,100,255,0.7);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        .lp-forgot:hover { color: #a78bfa; }

        /* Input with icon */
        .lp-input-row {
          position: relative;
          display: flex;
          align-items: center;
        }

        .lp-input-icon {
          position: absolute;
          left: 14px;
          color: rgba(160,160,200,0.45);
          display: flex;
          align-items: center;
          pointer-events: none;
          z-index: 1;
        }

        .lp-input {
          width: 100%;
          background: rgba(10, 8, 30, 0.65);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 12px 44px 12px 40px;
          color: #e0e0f5;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 400;
          outline: none;
          caret-color: #7c3aed;
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          letter-spacing: 0.01em;
        }
        .lp-input::placeholder {
          color: rgba(160,160,200,0.3);
          font-size: 13.5px;
        }
        .lp-input:focus {
          background: rgba(15, 10, 40, 0.75);
          border-color: rgba(124, 58, 237, 0.55);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
        }
        .lp-input.pass-input {
          letter-spacing: 0.12em;
        }
        .lp-input.pass-input::placeholder {
          letter-spacing: 0.04em;
        }

        /* Eye toggle */
        .lp-eye {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(160,160,200,0.35);
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .lp-eye:hover { color: rgba(124,58,237,0.7); }

        /* Sign In button */
        .lp-btn {
          position: relative;
          width: 100%;
          padding: 13px 20px;
          margin-top: 6px;
          background: linear-gradient(135deg, #4f35e8 0%, #3730dc 60%, #2563eb 100%);
          border: none;
          border-radius: 100px;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.015em;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 4px 28px rgba(79,53,232,0.55);
          transition: transform 0.2s, box-shadow 0.25s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .lp-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 36px rgba(79,53,232,0.65);
        }
        .lp-btn:active:not(:disabled) { transform: scale(0.98); }
        .lp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .lp-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.14) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        .lp-btn:hover:not(:disabled)::after { transform: translateX(100%); }

        .lp-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lp-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes lp-spin { to { transform: rotate(360deg); } }

        /* Signup link */
        .lp-signup-row {
          text-align: center;
          margin-top: 18px;
          font-size: 13.5px;
          color: rgba(160,160,200,0.55);
          font-weight: 400;
          animation: lp-fadeup 0.55s 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        .lp-signup-row a {
          color: rgba(160,160,200,0.9);
          font-weight: 700;
          text-decoration: none;
          transition: color 0.2s;
        }
        .lp-signup-row a:hover { color: #a78bfa; }

        /* Secure badge */
        .lp-secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 20px;
          font-size: 11.5px;
          color: rgba(160,160,200,0.3);
          font-weight: 400;
          letter-spacing: 0.01em;
          animation: lp-fadeup 0.55s 0.36s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* Bottom copyright */
        .lp-footer {
          position: relative;
          z-index: 1;
          margin-top: 32px;
          font-size: 12px;
          color: rgba(160,160,200,0.22);
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.01em;
        }

        @media (max-width: 480px) {
          .lp-card { padding: 32px 22px; }
        }
      `}</style>

      <div className="lp-root">

        {/* Top glowing blue orb — pulses up & down */}
        <div className="lp-glow-orb" />

        {/* ── Card ── */}
        <div className="lp-card">

          {/* Heading */}
          <h1 className="lp-heading">Welcome Back</h1>
          <p className="lp-subheading">Continue your journey DSA mastery.</p>

          {/* Google */}
          <div className="lp-google-wrap">
            <GoogleLoginButton />
          </div>

          {/* Divider */}
          <div className="lp-divider"><span>OR CONTINUE WITH EMAIL</span></div>

          {/* Error */}
          {error && (
            <div className="lp-error">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="lp-form">

            {/* Email */}
            <div className="lp-field">
              <div className="lp-field-header">
                <label className="lp-label" htmlFor="email">Email Address</label>
              </div>
              <div className="lp-input-row">
                <span className="lp-input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 7L2 7"/>
                  </svg>
                </span>
                <input
                  className="lp-input"
                  id="email" type="email" name="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="lp-field">
              <div className="lp-field-header">
                <label className="lp-label" htmlFor="password">Password</label>
                <a href="#" className="lp-forgot">Forgot password?</a>
              </div>
              <div className="lp-input-row">
                <span className="lp-input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  className={`lp-input${!showPass ? " pass-input" : ""}`}
                  id="password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lp-eye"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button className="lp-btn" type="submit" disabled={loading}>
              {loading ? <span className="lp-spinner" /> : null}
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          {/* Sign up link */}
          <p className="lp-signup-row">
            Don't have an account?{" "}
            <Link to="/Signup">Sign up</Link>
          </p>

          {/* Secure badge */}
          <div className="lp-secure">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Secure 256-bit Encryption
          </div>
        </div>

        {/* Copyright */}
        <p className="lp-footer">© 2025 InterviewPrep. All rights reserved.</p>
      </div>
    </>
  );
};

export default Login;