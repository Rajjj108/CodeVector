/**
 * DashboardFooter.jsx
 * A sleek, themed footer for the Dashboard — teal/dark coding platform aesthetic.
 * Uses GSAP for a subtle entrance animation.
 */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

const NAV_LINKS = [
  { label: "Dashboard",   to: "/dashboard" },
  { label: "Problems",    to: "/problems"  },
  { label: "Notes",       to: "/notes"     },
  { label: "Tracker",     to: "/tracker"   },
];

const SOCIALS = [
  { label: "GitHub",    href: "https://github.com/Rajjj108",   icon: "⌥" },
  { label: "LinkedIn",  href: "https://www.linkedin.com/in/mayankmishra108/", icon: "⊞" },
  { label: "Twitter/X", href: "https://x.com/Rajjj_108",        icon: "✕" },
];

const TEAL     = "#00e5a0";
const TEAL_DIM = "rgba(0,229,160,0.55)";
const MUTED    = "rgba(148,163,184,0.5)";
const BORDER   = "rgba(0,229,160,0.12)";

const DashboardFooter = () => {
  const footerRef = useRef(null);
  const navigate  = useNavigate();

  useEffect(() => {
    if (!footerRef.current) return;
    const ob = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        gsap.fromTo(footerRef.current,
          { opacity: 0, y: 22, filter: "blur(6px)" },
          { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.7, ease: "expo.out" }
        );
        ob.disconnect();
      }
    }, { threshold: 0.1 });
    ob.observe(footerRef.current);
    return () => ob.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      style={{
        marginTop: 48,
        borderTop: `1px solid ${BORDER}`,
        background: "rgba(6,10,8,0.82)",
        backdropFilter: "blur(20px)",
        padding: "32px 10% 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top shimmer */}
      <div style={{
        position: "absolute", top: 0, left: "5%", right: "5%", height: 1,
        background: `linear-gradient(90deg,transparent,${TEAL}45,transparent)`,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 32, flexWrap: "wrap", marginBottom: 28 }}>

        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Hex logo */}
            <svg width="28" height="28" viewBox="0 0 32 32" style={{ filter: `drop-shadow(0 0 8px ${TEAL})` }}>
              <polygon points="16,2 28,9 28,23 16,30 4,23 4,9"
                fill="none" stroke={TEAL} strokeWidth="1.8" />
              <polygon points="16,8 23,12 23,20 16,24 9,20 9,12"
                fill={TEAL} opacity="0.12" />
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
                fill={TEAL} fontSize="10" fontWeight="800" fontFamily="'DM Mono',monospace">CV</text>
            </svg>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#e6edf3", letterSpacing: "-0.01em" }}>
                Code<span style={{ color: TEAL }}>Vektor</span>
              </p>
              <p style={{ margin: 0, fontSize: 9, color: MUTED, fontFamily: "'DM Mono',monospace", letterSpacing: "0.15em" }}>
                DSA · PRACTICE · REVIEW
              </p>
            </div>
          </div>
          <p style={{ fontSize: 11.5, color: MUTED, maxWidth: 240, lineHeight: 1.65, margin: 0 }}>
            Your personal DSA practice hub with AI-powered code review and streak tracking.
          </p>
        </div>

        {/* Nav links */}
        <div>
          <p style={{ margin: "0 0 12px", fontSize: 8.5, letterSpacing: "0.3em", color: TEAL_DIM, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>NAVIGATE</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {NAV_LINKS.map(({ label, to }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  textAlign: "left", fontSize: 12.5, color: MUTED,
                  fontFamily: "var(--font-display)", fontWeight: 600,
                  transition: "color 0.18s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = TEAL}
                onMouseLeave={e => e.currentTarget.style.color = MUTED}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Socials */}
        <div>
          <p style={{ margin: "0 0 12px", fontSize: 8.5, letterSpacing: "0.3em", color: TEAL_DIM, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>CONNECT</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SOCIALS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  textDecoration: "none", fontSize: 12.5, color: MUTED,
                  fontFamily: "var(--font-display)", fontWeight: 600,
                  transition: "color 0.18s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = TEAL}
                onMouseLeave={e => e.currentTarget.style.color = MUTED}
              >
                <span style={{ fontSize: 10 }}>{icon}</span>
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Mini status widget */}
        <div style={{
          background: "rgba(0,229,160,0.04)", border: `1px solid ${BORDER}`,
          borderRadius: 14, padding: "16px 20px", minWidth: 170,
        }}>
          <p style={{ margin: "0 0 12px", fontSize: 8.5, letterSpacing: "0.3em", color: TEAL_DIM, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>SYSTEM STATUS</p>
          {[
            { label: "API Server",     ok: true },
            { label: "Code Execution", ok: true },
            { label: "AI Review",      ok: true },
          ].map(({ label, ok }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: ok ? TEAL : "#f87171",
                boxShadow: ok ? `0 0 8px ${TEAL}` : "0 0 8px #f87171",
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Mono',monospace" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: `1px solid ${BORDER}`,
        paddingTop: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8,
      }}>
        <p style={{ margin: 0, fontSize: 10, color: MUTED, fontFamily: "'DM Mono',monospace" }}>
          © {new Date().getFullYear()} CodeVektor · Built for developers, by developers
        </p>
        <p style={{ margin: 0, fontSize: 10, color: MUTED, fontFamily: "'DM Mono',monospace" }}>
          Powered by{" "}
          <span style={{ color: TEAL }}>Gemini AI</span>
          {" "}·{" "}
          <span style={{ color: TEAL }}>MongoDB</span>
          {" "}·{" "}
          <span style={{ color: TEAL }}>React</span>
          {" "}·{" "}
          <span style={{ color: TEAL }}>GSAP</span>
        </p>
      </div>
    </footer>
  );
};

export default DashboardFooter;
