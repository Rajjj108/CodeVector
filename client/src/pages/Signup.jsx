import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import GoogleLoginButton from "../components/GoogleLoginButton";

const getStrength = (password) => {
  let score = 0;
  if (!password) return { score: 0, label: "", color: "" };
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "#f43f5e" };
  if (score <= 3) return { score, label: "Fair",   color: "#f59e0b" };
  return             { score, label: "Strong", color: "#10b981" };
};

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm]           = useState({ name: "", email: "", password: "" });
  const [error, setError]         = useState("");
  const [confirm, setConfirm]     = useState("");
  const [focused, setFocused]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);

  const strength = getStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== confirm)  return setError("Passwords do not match.");
    setLoading(true);
    try {
      await API.post("/auth/signup", form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const rules = [
    { label: "6+ characters", met: form.password.length >= 6 },
    { label: "Uppercase",     met: /[A-Z]/.test(form.password) },
    { label: "Number",        met: /[0-9]/.test(form.password) },
  ];

  const EyeOpen = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
  const EyeOff = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .su-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(145deg, #030508 0%, #07091a 45%, #030810 100%);
          font-family: var(--font-body);
          overflow: hidden; position: relative; padding: 40px 20px;
        }

        .su-orb { position: fixed; border-radius: 50%; pointer-events: none; z-index: 0; filter: blur(70px); }
        .su-orb-1 { width:550px;height:550px;top:-120px;left:-80px;
          background:radial-gradient(circle,rgba(16,185,129,0.11) 0%,transparent 65%);
          animation:floatA 17s ease-in-out infinite; }
        .su-orb-2 { width:420px;height:420px;bottom:-100px;right:-60px;
          background:radial-gradient(circle,rgba(99,102,241,0.12) 0%,transparent 65%);
          animation:floatB 13s ease-in-out infinite; }
        .su-orb-3 { width:280px;height:280px;top:40%;left:35%;
          background:radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 65%);
          animation:floatC 9s ease-in-out infinite; }
        @keyframes floatA{0%,100%{transform:translate(0,0)}50%{transform:translate(35px,28px)}}
        @keyframes floatB{0%,100%{transform:translate(0,0)}50%{transform:translate(-28px,-35px)}}
        @keyframes floatC{0%,100%{transform:translate(0,0)}50%{transform:translate(16px,-20px)}}

        .su-grid {
          position:fixed;inset:0;z-index:0;opacity:0.02;pointer-events:none;
          background-image:linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px);
          background-size:72px 72px;
        }

        /* Particles */
        .su-particle {
          position:fixed;border-radius:50%;background:rgba(255,255,255,0.04);
          pointer-events:none;z-index:0;animation:particleDrift linear infinite;
        }
        @keyframes particleDrift {
          0%{transform:translateY(100vh) scale(0);opacity:0}
          10%{opacity:1}90%{opacity:0.2}
          100%{transform:translateY(-5vh) scale(1.3);opacity:0}
        }

        /* Card */
        .su-card {
          position:relative;z-index:10;width:100%;max-width:460px;
          padding:48px 44px;
          background:linear-gradient(135deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.02) 100%);
          border:1px solid rgba(255,255,255,0.09);
          border-top:1px solid rgba(255,255,255,0.13);
          border-radius:24px;
          backdrop-filter:blur(36px) saturate(160%);
          -webkit-backdrop-filter:blur(36px) saturate(160%);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.08),
            0 40px 100px rgba(0,0,0,0.65),
            0 0 80px rgba(16,185,129,0.06),
            0 0 0 1px rgba(255,255,255,0.04);
          animation:cardIn 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes cardIn {
          from{opacity:0;transform:translateY(40px) scale(0.96);filter:blur(6px)}
          to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}
        }

        /* Top shimmer */
        .su-card::before {
          content:'';position:absolute;top:0;left:15%;right:15%;height:1px;
          background:linear-gradient(90deg,transparent,rgba(16,185,129,0.55),rgba(99,102,241,0.55),transparent);
          border-radius:1px;
        }

        /* Corner glow dot */
        .su-card::after {
          content:'';position:absolute;top:-3px;right:50px;
          width:6px;height:6px;border-radius:50%;
          background:#10b981;
          box-shadow:0 0 12px 4px rgba(16,185,129,0.45);
          animation:glowPulse 2s ease-in-out infinite;
        }
        @keyframes glowPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.75)}}

        /* Badge */
        .su-badge {
          display:inline-flex;align-items:center;gap:7px;
          background:rgba(16,185,129,0.09);
          border:1px solid rgba(16,185,129,0.22);
          border-radius:100px;padding:5px 14px 5px 9px;
          margin-bottom:18px;
          animation:fadeUp 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }
        .su-badge-dot{width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 6px rgba(16,185,129,0.7);}
        .su-badge-text{font-family:'DM Mono',monospace;font-size:8.5px;font-weight:500;letter-spacing:0.2em;text-transform:uppercase;color:#10b981;}

        .su-title {
          font-family:var(--font-display);font-size:30px;font-weight:900;letter-spacing:-0.04em;
          margin-bottom:5px;color:#f1f5f9;
          animation:fadeUp 0.5s 0.15s cubic-bezier(0.16,1,0.3,1) both;
        }
        .su-title .grad {
          background:linear-gradient(135deg,#10b981,#6366f1);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .su-sub {
          font-size:12.5px;color:rgba(148,163,184,0.45);font-weight:300;margin-bottom:28px;
          animation:fadeUp 0.5s 0.2s cubic-bezier(0.16,1,0.3,1) both;
        }

        .su-error {
          display:flex;align-items:flex-start;gap:9px;
          background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.25);
          border-radius:12px;padding:11px 14px;font-size:12px;color:#fb7185;
          margin-bottom:18px;
          animation:errIn 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes errIn{from{opacity:0;transform:translateY(-6px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}

        .su-form{display:flex;flex-direction:column;gap:14px;}

        .su-field{animation:fadeUp cubic-bezier(0.16,1,0.3,1) both;}
        .su-field:nth-child(1){animation-duration:0.5s;animation-delay:0.24s}
        .su-field:nth-child(2){animation-duration:0.5s;animation-delay:0.30s}
        .su-field:nth-child(3){animation-duration:0.5s;animation-delay:0.36s}
        .su-field:nth-child(4){animation-duration:0.5s;animation-delay:0.42s}

        .su-label-row{
          display:flex;justify-content:space-between;align-items:center;
          font-size:9.5px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;
          color:rgba(148,163,184,0.4);margin-bottom:7px;
          transition:color 0.3s;
        }
        .su-field.focused .su-label-row{color:rgba(52,211,153,0.85);}

        .su-iw{position:relative;}
        .su-input{
          width:100%;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:13px;padding:12px 16px;padding-right:42px;
          color:#f0f0ff;font-family:var(--font-body);
          font-size:14px;font-weight:300;
          outline:none;caret-color:#10b981;
          transition:border-color 0.3s,background 0.3s,box-shadow 0.3s;
        }
        .su-input::placeholder{color:rgba(255,255,255,0.14);}
        .su-input:focus{
          background:rgba(16,185,129,0.07);
          border-color:rgba(16,185,129,0.4);
          box-shadow:0 0 0 4px rgba(16,185,129,0.09);
        }
        .su-input.valid{border-color:rgba(16,185,129,0.35);}
        .su-input.invalid{border-color:rgba(244,63,94,0.35);}

        .su-eye{
          position:absolute;right:13px;top:50%;transform:translateY(-50%);
          background:none;border:none;cursor:pointer;
          color:rgba(148,163,184,0.3);padding:4px;
          transition:color 0.2s;
        }
        .su-eye:hover{color:rgba(52,211,153,0.7);}

        /* Strength meter */
        .su-strength{margin-top:10px;}
        .su-bars{display:flex;gap:4px;margin-bottom:7px;}
        .su-bar{
          flex:1;height:3px;border-radius:999px;
          background:rgba(255,255,255,0.07);
          transition:background 0.3s;
        }
        .su-bar.filled{background:var(--sc);}
        .su-str-row{display:flex;justify-content:space-between;align-items:center;}
        .su-rules{display:flex;gap:10px;}
        .su-rule{
          display:flex;align-items:center;gap:5px;
          font-size:9.5px;color:rgba(148,163,184,0.35);
          font-family:'DM Mono',monospace;letter-spacing:0.05em;
          transition:color 0.3s;
        }
        .su-rule.met{color:rgba(16,185,129,0.8);}
        .su-rule-dot{width:5px;height:5px;border-radius:50%;background:currentColor;}
        .su-str-label{
          font-family:'DM Mono',monospace;font-size:9px;
          letter-spacing:0.15em;font-weight:500;
        }

        /* Match label */
        .su-match{font-size:9px;font-family:'DM Mono',monospace;font-weight:500;letter-spacing:0.1em;}
        .su-match.ok{color:rgba(16,185,129,0.85);}
        .su-match.no{color:rgba(244,63,94,0.8);}

        /* Submit btn */
        .su-btn{
          position:relative;width:100%;padding:14px;margin-top:4px;
          background:linear-gradient(135deg,#059669 0%,#10b981 40%,#6366f1 100%);
          background-size:200% 200%;
          border:none;border-radius:14px;
          color:#fff;font-family:var(--font-display);
          font-size:13px;font-weight:700;letter-spacing:0.08em;
          cursor:pointer;overflow:hidden;
          box-shadow:0 4px 30px rgba(16,185,129,0.3);
          transition:transform 0.2s,box-shadow 0.3s,background-position 0.5s;
          animation:fadeUp 0.5s 0.48s cubic-bezier(0.16,1,0.3,1) both;
        }
        .su-btn:hover:not(:disabled){
          transform:translateY(-2px);background-position:100% 0;
          box-shadow:0 8px 40px rgba(16,185,129,0.45);
        }
        .su-btn:active:not(:disabled){transform:translateY(0) scale(0.98);}
        .su-btn:disabled{opacity:0.6;cursor:not-allowed;}
        .su-btn::after{
          content:'';position:absolute;inset:0;
          background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.2) 50%,transparent 60%);
          transform:translateX(-100%);transition:transform 0.55s ease;
        }
        .su-btn:hover::after{transform:translateX(100%);}

        .su-spinner{
          display:inline-block;width:13px;height:13px;
          border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;
          border-radius:50%;animation:spin 0.7s linear infinite;
          vertical-align:middle;margin-right:8px;
        }
        @keyframes spin{to{transform:rotate(360deg)}}

        .su-footer{
          margin-top:20px;text-align:center;
          animation:fadeUp 0.5s 0.54s cubic-bezier(0.16,1,0.3,1) both;
        }
        .su-footer p{font-size:12.5px;color:rgba(255,255,255,0.28);}
        .su-footer a{
          color:#10b981;text-decoration:none;font-weight:500;
          transition:color 0.2s,text-shadow 0.2s;
        }
        .su-footer a:hover{color:#34d399;text-shadow:0 0 12px rgba(16,185,129,0.5);}

        @keyframes fadeUp{
          from{opacity:0;transform:translateY(14px)}
          to{opacity:1;transform:translateY(0)}
        }

        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(16,185,129,0.2);border-radius:999px;}
      `}</style>

      <div className="su-root">
        <div className="su-orb su-orb-1" />
        <div className="su-orb su-orb-2" />
        <div className="su-orb su-orb-3" />
        <div className="su-grid" />

        {/* Particles */}
        {[...Array(10)].map((_, i) => (
          <div key={i} className="su-particle" style={{
            left: `${5 + i * 9}%`,
            width: `${4 + (i % 3) * 3}px`,
            height: `${4 + (i % 3) * 3}px`,
            animationDuration: `${11 + i * 2}s`,
            animationDelay: `${i * 1.1}s`,
          }} />
        ))}

        <div className="su-card">
          {/* Badge */}
          <div className="su-badge">
            <div className="su-badge-dot" />
            <span className="su-badge-text">New Account</span>
          </div>

          <h1 className="su-title">
            Join the <span className="grad">Journey</span>
          </h1>
          <p className="su-sub">Create your account and start practicing today</p>

          {error && (
            <div className="su-error">
              <span>⚠</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="su-form">

            {/* Name */}
            <div className={`su-field${focused === "name" ? " focused" : ""}`}>
              <div className="su-label-row">Full Name</div>
              <div className="su-iw">
                <input
                  type="text" name="name"
                  placeholder="Your full name"
                  className={`su-input${form.name.length > 1 ? " valid" : ""}`}
                  onChange={handleChange}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className={`su-field${focused === "email" ? " focused" : ""}`}>
              <div className="su-label-row">Email Address</div>
              <div className="su-iw">
                <input
                  type="email" name="email"
                  placeholder="you@example.com"
                  className={`su-input${form.email.includes("@") ? " valid" : ""}`}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className={`su-field${focused === "password" ? " focused" : ""}`}>
              <div className="su-label-row">Password</div>
              <div className="su-iw">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  className={`su-input${form.password.length >= 6 ? " valid" : form.password.length > 0 ? " invalid" : ""}`}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  required
                />
                <button type="button" className="su-eye" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
              {form.password && (
                <div className="su-strength">
                  <div className="su-bars">
                    {[1,2,3,4,5].map(n => (
                      <div key={n} className={`su-bar${strength.score >= n ? " filled" : ""}`}
                        style={{ "--sc": strength.color }} />
                    ))}
                  </div>
                  <div className="su-str-row">
                    <div className="su-rules">
                      {rules.map(r => (
                        <div key={r.label} className={`su-rule${r.met ? " met" : ""}`}>
                          <div className="su-rule-dot" />{r.label}
                        </div>
                      ))}
                    </div>
                    <span className="su-str-label" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className={`su-field${focused === "confirm" ? " focused" : ""}`}>
              <div className="su-label-row">
                Confirm Password
                {confirm && form.password && (
                  <span className={`su-match${confirm === form.password ? " ok" : " no"}`}>
                    {confirm === form.password ? "✓ Matches" : "✗ No match"}
                  </span>
                )}
              </div>
              <div className="su-iw">
                <input
                  type={showConf ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className={`su-input${confirm ? (confirm === form.password ? " valid" : " invalid") : ""}`}
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); if (error) setError(""); }}
                  onFocus={() => setFocused("confirm")}
                  onBlur={() => setFocused("")}
                  required
                />
                <button type="button" className="su-eye" onClick={() => setShowConf(!showConf)} tabIndex={-1}>
                  {showConf ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            <button className="su-btn" type="submit" disabled={loading}>
              {loading && <span className="su-spinner" />}
              {loading ? "Creating Account…" : "Create Account →"}
            </button>
          </form>

          <GoogleLoginButton />

          <div className="su-footer">
            <p>Already have an account? <Link to="/login">Back to Login</Link></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;