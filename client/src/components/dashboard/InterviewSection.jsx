/**
 * InterviewSection.jsx — Coming Soon placeholder
 * Mirrors the MockTests "coming soon" style with interview-specific features.
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";

const FEATURES = [
  { icon: "◈", label: "Company-Wise",     desc: "FAANG & top-tier questions"   },
  { icon: "◎", label: "Topic Targeting",  desc: "Arrays, DP, Graphs & more"    },
  { icon: "◆", label: "Saved Questions",  desc: "Bookmark for quick revision"  },
  { icon: "▣", label: "Mock Interviews",  desc: "Real-time timed practice"      },
];

const InterviewSection = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const items = containerRef.current.querySelectorAll(".iq-item");
    gsap.fromTo(items,
      { opacity: 0, y: 20, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, stagger: 0.1, ease: "expo.out", delay: 0.15 }
    );
    const badge = containerRef.current.querySelector(".cs-badge");
    if (badge) gsap.to(badge, {
      boxShadow: "0 0 24px rgba(34,211,238,0.55), 0 0 48px rgba(34,211,238,0.2)",
      repeat: -1, yoyo: true, duration: 1.8, ease: "sine.inOut",
    });
  }, []);

  return (
    <div ref={containerRef} style={{ padding: "28px 24px", boxSizing: "border-box" }}>
      {/* Badge */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <div className="cs-badge iq-item" style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 20px", borderRadius: 999,
          background: "rgba(0,229,160,0.1)",
          border: "1px solid rgba(0,229,160,0.35)",
          boxShadow: "0 0 16px rgba(0,229,160,0.2)",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00e5a0", boxShadow: "0 0 8px #00e5a0", animation: "livepulse 1.4s infinite" }} />
          <span style={{ fontSize: 10, letterSpacing: "0.35em", fontFamily: "var(--font-display)", color: "#00e5a0" }}>COMING SOON</span>
        </div>
      </div>

      {/* Headline */}
      <h2 className="iq-item" style={{
        fontSize: 22, margin: "0 0 6px", textAlign: "center",
        fontFamily: "var(--font-display)", letterSpacing: "0.05em",
        background: "linear-gradient(120deg,#e6edf3 30%,#00e5a0 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>Interview Questions</h2>
      <p className="iq-item" style={{
        fontSize: 12, color: "#8b949e", textAlign: "center",
        fontFamily: "var(--font-mono)", letterSpacing: "0.1em", margin: "0 0 22px",
      }}>Curated question bank · under development</p>

      {/* Feature list — single column, no overflow */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
        {FEATURES.map(f => (
          <div key={f.label} className="iq-item" style={{
            padding: "12px 16px",
            background: "rgba(0,229,160,0.04)",
            border: "1px solid rgba(0,229,160,0.14)",
            borderRadius: 10, display: "flex", alignItems: "center", gap: 14,
          }}>
            <div style={{ fontSize: 18, color: "#00e5a0", flexShrink: 0 }}>{f.icon}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#e6edf3", fontFamily: "var(--font-display)" }}>{f.label}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#8b949e", fontFamily: "var(--font-mono)" }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button className="iq-item" style={{
        width: "100%", padding: "12px 0",
        background: "rgba(0,229,160,0.1)",
        border: "1px solid rgba(0,229,160,0.3)",
        borderRadius: 12, cursor: "pointer",
        fontSize: 11, letterSpacing: "0.3em",
        fontFamily: "var(--font-display)", color: "#00e5a0",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,229,160,0.2)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,229,160,0.1)"; }}
      >
        NOTIFY ME ON LAUNCH
      </button>
    </div>
  );
};

export default InterviewSection;