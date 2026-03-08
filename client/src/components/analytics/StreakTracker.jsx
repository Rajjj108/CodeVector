import { useEffect, useRef } from "react";
import gsap from "gsap";

const StreakTracker = ({ streak = 0 }) => {
  const ref      = useRef(null);
  const flameRef = useRef(null);
  const numRef   = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 16, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }
    );
    gsap.to(flameRef.current, {
      scale: 1.15, rotate: 5, duration: 0.7, repeat: -1, yoyo: true, ease: "sine.inOut",
    });
    gsap.fromTo(numRef.current,
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, duration: 0.5, delay: 0.3, ease: "back.out(2)" }
    );
  }, []);

  // Build streak dots (last 7 days placeholder)
  const MAX = 7;
  const activeDays = Math.min(streak, MAX);

  return (
    <div
      ref={ref}
      style={{
        fontFamily: "var(--font-display)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(251,191,36,0.2)",
        borderRadius: 20,
        padding: "22px 24px",
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.25), 0 0 40px rgba(251,191,36,0.04), inset 0 1px 0 rgba(255,255,255,0.07)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: -30, right: -20, width: 140, height: 140, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)",
        filter: "blur(20px)", pointerEvents: "none",
      }} />

      <p style={{ fontSize: 9, letterSpacing: "0.4em", color: "rgba(251,191,36,0.5)", fontFamily: "'DM Mono', monospace", margin: "0 0 14px" }}>
        ▸ STREAK_TRACKER
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
        {/* Flame */}
        <span ref={flameRef} style={{ fontSize: 32, display: "inline-block", filter: "drop-shadow(0 0 10px rgba(251,191,36,0.6))" }}>
          🔥
        </span>
        <div>
          <p style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(251,191,36,0.55)", fontFamily: "'DM Mono', monospace", margin: "0 0 2px" }}>
            CURRENT STREAK
          </p>
          <p ref={numRef} style={{
            fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em", margin: 0,
            background: "linear-gradient(120deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {streak}
            <span style={{ fontSize: 14, fontWeight: 600, opacity: 0.7, marginLeft: 4 }}>days</span>
          </p>
        </div>
      </div>

      {/* Week dots */}
      <div>
        <p style={{ fontSize: 9, color: "rgba(148,163,184,0.4)", letterSpacing: "0.2em", fontFamily: "'DM Mono', monospace", margin: "0 0 8px" }}>
          LAST 7 DAYS
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: MAX }).map((_, i) => {
            const active = i < activeDays;
            return (
              <div key={i} style={{
                flex: 1, height: 6, borderRadius: 999,
                background: active ? "#fbbf24" : "rgba(255,255,255,0.07)",
                boxShadow: active ? "0 0 6px rgba(251,191,36,0.5)" : "none",
                transition: "background 0.3s",
              }} />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StreakTracker;