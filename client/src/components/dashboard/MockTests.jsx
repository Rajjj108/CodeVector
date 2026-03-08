/**
 * MockTests.jsx — Coming Soon placeholder
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";

const FEATURES = [
  { icon: "⏱", label: "Timed Sessions",  desc: "45-min full mock rounds"  },
  { icon: "🎯", label: "Topic Targeting", desc: "Arrays, Trees, DP & more" },
  { icon: "📊", label: "Score Analytics", desc: "Percentile vs peers"      },
  { icon: "🔁", label: "Review Mode",     desc: "Missed-question drills"   },
];

const MockTests = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll(".mf-item");
    gsap.fromTo(items,
      { opacity: 0, y: 20, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, stagger: 0.1, ease: "expo.out", delay: 0.15 }
    );
    const badge = containerRef.current.querySelector(".cs-badge");
    if (badge) gsap.to(badge, {
      boxShadow: "0 0 24px rgba(167,139,250,0.55), 0 0 48px rgba(167,139,250,0.2)",
      repeat: -1, yoyo: true, duration: 1.8, ease: "sine.inOut",
    });
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", textAlign: "center", padding: "28px 24px" }}>
      {/* Badge */}
      <div className="cs-badge mf-item" style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "5px 16px", borderRadius: 999,
        background: "rgba(167,139,250,0.12)",
        border: "1px solid rgba(167,139,250,0.3)",
        boxShadow: "0 0 16px rgba(167,139,250,0.25)",
        marginBottom: 18,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%", background: "#a78bfa",
          boxShadow: "0 0 8px #a78bfa", animation: "livepulse 1.4s infinite",
        }} />
        <span style={{
          fontSize: 9, letterSpacing: "0.35em",
          fontFamily: "var(--font-display)", color: "#a78bfa",
        }}>COMING SOON</span>
      </div>

      {/* Headline */}
      <h2 className="mf-item" style={{
        fontSize: 22, margin: "0 0 6px",
        fontFamily: "var(--font-display)",
        letterSpacing: "0.05em",
        background: "linear-gradient(120deg,#f1f5f9 30%,#a78bfa 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>Mock Tests</h2>
      <p className="mf-item" style={{
        fontSize: 11, color: "rgba(148,163,184,0.45)",
        fontFamily: "var(--font-mono)", letterSpacing: "0.1em", margin: "0 0 22px",
      }}>
        Full interview simulations · under development
      </p>

      {/* Feature grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {FEATURES.map(f => (
          <div key={f.label} className="mf-item" style={{
            padding: "14px 12px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14, textAlign: "left",
          }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{f.icon}</div>
            <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 700, color: "#e2e8f0",
              fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}>{f.label}</p>
            <p style={{ margin: 0, fontSize: 9, color: "rgba(148,163,184,0.4)",
              fontFamily: "var(--font-mono)" }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Notify CTA */}
      <button className="mf-item" style={{
        width: "100%", padding: "11px 0",
        background: "rgba(167,139,250,0.1)",
        border: "1px solid rgba(167,139,250,0.25)",
        borderRadius: 12, cursor: "pointer",
        fontSize: 10, letterSpacing: "0.3em",
        fontFamily: "var(--font-display)", color: "rgba(167,139,250,0.65)",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(167,139,250,0.2)"; e.currentTarget.style.color = "#a78bfa"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(167,139,250,0.1)"; e.currentTarget.style.color = "rgba(167,139,250,0.65)"; }}
      >
        NOTIFY ME ON LAUNCH
      </button>
    </div>
  );
};

export default MockTests;