import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import gsap from "gsap";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const dividerRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.fromTo(dividerRef.current,
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: 0.6, transformOrigin: "center" }
    ).fromTo(btnRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.6 }, "-=0.3"
    );
  }, []);

  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(errorRef.current,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [error]);

  const handleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");
      // Button pulse while loading
      gsap.to(btnRef.current, { scale: 0.97, duration: 0.2 });
      const res = await axios.post((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/auth/google", {
        token: credentialResponse.credential,
      }, { withCredentials: true });
      login(res.data.user); // update AuthContext — cookie is set by server
      // Success flash
      gsap.to(btnRef.current, { scale: 1, boxShadow: "0 0 30px rgba(34,211,238,0.4)", duration: 0.3, onComplete: () => navigate("/dashboard", { replace: true }) });
    } catch (err) {
      console.error(err);
      setError("Authentication failed. Please try again.");
      gsap.to(btnRef.current, { x: [-4, 4, -3, 3, 0], duration: 0.4, ease: "none" });
    } finally {
      setLoading(false);
    }
  };

  const onBtnEnter = () => {
    if (loading) return;
    gsap.to(btnRef.current, {
      scale: 1.02, y: -2,
      boxShadow: "0 12px 32px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.06)",
      borderColor: "rgba(255,255,255,0.2)",
      duration: 0.3, ease: "power2.out",
    });
  };
  const onBtnLeave = () => {
    gsap.to(btnRef.current, {
      scale: 1, y: 0,
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      borderColor: "rgba(255,255,255,0.1)",
      duration: 0.4, ease: "power3.out",
    });
  };

  return (
    <div ref={wrapRef} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>

      {/* Divider */}
      <div ref={dividerRef} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15))" }} />
        <span style={{
          fontSize: 10, color: "rgba(148,163,184,0.5)", letterSpacing: "0.25em",
          textTransform: "uppercase", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
        }}>
          continue with
        </span>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.15), transparent)" }} />
      </div>

      {/* Google button */}
      <div
        ref={btnRef}
        onMouseEnter={onBtnEnter}
        onMouseLeave={onBtnLeave}
        style={{
          position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          padding: "14px 20px", borderRadius: 16,
          background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(16px)",
          cursor: loading ? "wait" : "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          pointerEvents: loading ? "none" : "auto",
          opacity: loading ? 0.75 : 1,
          transition: "opacity 0.3s",
          willChange: "transform",
        }}
      >
        {/* Google G logo */}
        {!loading ? (
          <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, flexShrink: 0 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09A7.5 7.5 0 0 1 5.5 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        ) : (
          <div style={{
            width: 18, height: 18, border: "2px solid rgba(255,255,255,0.2)",
            borderTopColor: "rgba(255,255,255,0.7)", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", flexShrink: 0,
          }} />
        )}

        <span style={{
          fontSize: 13, fontWeight: 700, color: "rgba(241,245,249,0.9)",
          letterSpacing: "0.04em", fontFamily: "var(--font-display)",
        }}>
          {loading ? "Authenticating..." : "Sign in with Google"}
        </span>

        {/* Invisible overlay for real GoogleLogin */}
        {!loading && (
          <div style={{ position: "absolute", inset: 0, opacity: 0 }}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError("Popup closed or failed")}
            />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div ref={errorRef} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", borderRadius: 12,
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
          <p style={{ color: "#f87171", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{error}</p>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default GoogleLoginButton;