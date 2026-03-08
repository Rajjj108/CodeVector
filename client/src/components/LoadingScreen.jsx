/**
 * LoadingScreen.jsx — Full-page loading screen with CodeVektor branding
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";

const LoadingScreen = ({ message = "INITIALIZING" }) => {
  const wrapRef  = useRef(null);
  const textRef  = useRef(null);
  const logoRef  = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const ring3Ref = useRef(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    gsap.fromTo(wrapRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );
    gsap.fromTo(logoRef.current,
      { opacity: 0, scale: 0.7, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, delay: 0.2, ease: "back.out(2)" }
    );
    gsap.fromTo(textRef.current,
      { opacity: 0, y: 16, filter: "blur(8px)" },
      { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.8, delay: 0.5, ease: "expo.out" }
    );
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        position:        "fixed", inset: 0, zIndex: 9999,
        display:         "flex", flexDirection: "column",
        alignItems:      "center", justifyContent: "center",
        gap:             40,
        background:      "#0d1117",
      }}
    >
      {/* Spinner rings */}
      <div style={{ position: "relative", width: 180, height: 180 }}>
        {/* Outer — slow, teal */}
        <div ref={ring1Ref} style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "1.5px solid rgba(0,229,160,0.08)",
          borderTopColor: "#00e5a0",
          animation: "spin 3s linear infinite",
          boxShadow: "0 0 30px rgba(0,229,160,0.12)",
        }} />
        {/* Mid — green, reverse */}
        <div ref={ring2Ref} style={{
          position: "absolute", inset: 18, borderRadius: "50%",
          border: "1.5px solid rgba(0,229,160,0.05)",
          borderBottomColor: "#00c47a",
          animation: "spin 2s linear infinite reverse",
          boxShadow: "0 0 20px rgba(0,229,160,0.08)",
        }} />
        {/* Inner — fast, white-ish */}
        <div ref={ring3Ref} style={{
          position: "absolute", inset: 36, borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
          borderRightColor: "rgba(255,255,255,0.35)",
          animation: "spin 1.1s linear infinite",
        }} />
        {/* Centre: CodeVektor logo */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <img
            ref={logoRef}
            src="/codevektor-logo.png"
            alt="CodeVektor"
            style={{ width: 52, height: 52, borderRadius: 10, objectFit: "contain" }}
          />
        </div>
      </div>

      {/* Brand name + tagline */}
      <div ref={textRef} style={{ textAlign: "center" }}>
        <p style={{
          margin: "0 0 6px", fontSize: 22, fontWeight: 900, letterSpacing: "0.05em",
          fontFamily: "var(--font-display)",
          background: "linear-gradient(120deg,#e2e8f0 30%,#00e5a0 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          <span style={{ WebkitTextFillColor: "#e2e8f0" }}>Code</span>
          <span>Vektor</span>
        </p>
        <p style={{
          margin: "0 0 14px", fontSize: 9, letterSpacing: "0.55em",
          fontFamily: "var(--font-mono)",
          color: "rgba(0,229,160,0.45)",
        }}>PRECISION ENGINEERING</p>
        <p style={{
          margin: 0, fontSize: 8, letterSpacing: "0.35em",
          fontFamily: "var(--font-mono)",
          color: "rgba(148,163,184,0.2)",
        }}>{message}</p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoadingScreen;
