/**
 * PageHeader.jsx
 *
 * Per-page header bar + full-screen overlay menu.
 * Contains: Nav links | Theme picker (Cyber/Night/Day) | Digital Writing toggle | Logout
 */
import { useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppBackground from "../AppBackground";
import { useTypewriter } from "./TypewriterContext";
import { useTheme } from "./ThemeContext";
import gsap from "gsap";

const NAV_LINKS = [
  { to: "/dashboard",   label: "Dashboard",  accent: "#a78bfa" },
  { to: "/dsa-tracker", label: "DSA Tracker", accent: "#22d3ee" },
  { to: "/notes",       label: "Notes",       accent: "#34d399" },
];

const THEME_OPTIONS = [
  { id: "cyber", label: "Cyber", icon: "◈", color: "#04d9a0", desc: "Neon Dark"  },
  { id: "night", label: "Night", icon: "◎", color: "#60a5fa", desc: "Deep Dark"  },
];

const PageHeader = ({
  label     = "",
  title     = "",
  gradient  = "linear-gradient(120deg,#f1f5f9 20%,#a78bfa 100%)",
  rightSlot = null,
  style     = {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { logout: authLogout } = useAuth();

  const { typewriterEnabled, toggleTypewriter } = useTypewriter();
  const { theme, setTheme } = useTheme();

  const overlayRef = useRef(null);
  const closeRef   = useRef(null);

  const isDark      = theme !== "day"; // day = light bg
  const activeTheme = THEME_OPTIONS.find(t => t.id === theme) || THEME_OPTIONS[0];
  const labelColor  = isDark ? "rgba(148,163,184,0.3)" : "rgba(5,37,88,0.45)";
  const divColor    = isDark ? "rgba(255,255,255,0.07)" : "rgba(82,127,176,0.2)";

  /* ── Open ── */
  const openNav = useCallback(() => {
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const links = overlayRef.current?.querySelectorAll(".nav-link-btn") ?? [];
      const settings = overlayRef.current?.querySelectorAll(".settings-anim") ?? [];
      gsap.timeline({ defaults: { ease: "expo.out" } })
        .fromTo(overlayRef.current,
          { opacity: 0, y: -20, filter: "blur(18px)" },
          { opacity: 1, y: 0,   filter: "blur(0px)", duration: 0.5 }
        )
        .fromTo(links,
          { opacity: 0, y: 55, filter: "blur(8px)" },
          { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.6, stagger: 0.1 },
          "-=0.3"
        )
        .fromTo(settings,
          { opacity: 0, y: 30, filter: "blur(6px)" },
          { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.5, stagger: 0.1 },
          "-=0.5"
        )
        .fromTo(closeRef.current,
          { opacity: 0, rotate: -90, scale: 0.4 },
          { opacity: 1, rotate: 0,   scale: 1,    duration: 0.38 },
          "-=0.5"
        );
    }));
  }, []);

  /* ── Close ── */
  const closeNav = useCallback((then) => {
    const links = overlayRef.current?.querySelectorAll(".nav-link-btn") ?? [];
    gsap.timeline({ defaults: { ease: "expo.in" } })
      .to(links, { opacity: 0, y: -36, filter: "blur(8px)", duration: 0.3, stagger: 0.05 })
      .to(overlayRef.current, { opacity: 0, y: -16, filter: "blur(14px)", duration: 0.35 }, "-=0.18")
      .call(() => { setOpen(false); then?.(); });
  }, []);

  const goTo  = useCallback((path) => closeNav(() => navigate(path)), [closeNav, navigate]);
  const logout = useCallback(() => closeNav(() => authLogout()), [closeNav, authLogout]);

  /* ── Hover ── */
  const linkIn  = (e) => gsap.to(e.currentTarget, { x: 16, duration: 0.22, ease: "power2.out" });
  const linkOut = (e) => gsap.to(e.currentTarget, { x: 0,  duration: 0.32, ease: "power2.out" });
  const xIn     = (e) => gsap.to(e.currentTarget, { rotate: 90,  scale: 1.2, color: "#f87171", duration: 0.28 });
  const xOut    = (e) => gsap.to(e.currentTarget, { rotate: 0,   scale: 1,   color: isDark ? "rgba(148,163,184,0.45)" : "rgba(30,41,59,0.45)", duration: 0.32 });

  return (
    <>
      {/* ── Header bar ── */}
      <header
        style={{
          position: "sticky", top: 0, zIndex: 40,
          padding: "18px 40px",
          background: "transparent",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          ...style,
        }}
      >
        {/* Left: hamburger + page label+title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Hamburger */}
          <button
            onClick={openNav}
            aria-label="Open menu"
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 5, width:55,height: 50,
              borderRadius: "50%", cursor: "pointer", flexShrink: 0,
              background:     `${activeTheme.color}18`,
              backdropFilter: "blur(12px)",
              boxShadow:      `0 0 18px ${activeTheme.color}30, 0 4px 14px rgba(0,0,0,0.4)`,
              border:         `1px solid ${activeTheme.color}28`,
              transition:     "all 0.4s ease",
            }}
          >
            <div style={{ width: 14, height: 1.5, borderRadius: 99, background: activeTheme.color }} />
            <div style={{ width: 9,  height: 1.5, borderRadius: 99, background: `${activeTheme.color}88` }} />
            <div style={{ width: 14, height: 1.5, borderRadius: 99, background: activeTheme.color }} />
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />

          {/* Title block */}
          <div>
            {label && (
              <p style={{
                fontSize: 8, letterSpacing: "0.5em", margin: "0 0 4px",
                fontFamily: "'DM Mono',monospace",
                color: isDark ? "rgba(0,229,160,0.45)" : "rgba(5,37,88,0.45)",
              }}>{label}</p>
            )}
            <h1 style={{
              fontSize: 26, fontWeight: 700, letterSpacing: "0.05em", margin: 0,
              fontFamily: "var(--font-elegant)",
              background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{title}</h1>
          </div>
        </div>

        {/* CENTER: Brand logo + name (absolute center) */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%,-50%)",
          display: "flex", alignItems: "center", gap: 10,
          cursor: "pointer",
        }}>
          <img
            src="/codevektor-logo.png"
            alt="CodeVektor"
            style={{ width: 42, height: 42, borderRadius: 9, objectFit: "contain" }}
          />
          <span style={{
            fontSize: 19, fontWeight: 900, letterSpacing: "0.05em",
            fontFamily: "var(--font-brand)",
            background: "linear-gradient(120deg,#e6edf3 20%,#00e5a0 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>CodeVektor</span>
        </div>

        {/* Right slot */}
        {rightSlot && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {rightSlot}
          </div>
        )}
      </header>

      {/* ── Overlay (Portal) ── */}
      {open && createPortal(
        <div
          ref={overlayRef}
          style={{
            position: "fixed", inset: 0,
            zIndex: 2147483647,
            background: isDark ? "#03040c" : "#f0f4f8",
            display: "flex", alignItems: "center",
            padding: "0 10vw",
            gap: "8vw",
            overflow: "hidden",
          }}
        >
          <AppBackground contained />

          {/* ✕ close — right edge center */}
          <button
            ref={closeRef}
            onClick={() => closeNav()}
            onMouseEnter={xIn}
            onMouseLeave={xOut}
            aria-label="Close menu"
            style={{
              position: "fixed", right: 36, top: "50%", transform: "translateY(-50%)",
              zIndex: 2147483648, fontSize: 42, fontWeight: 200, lineHeight: 1,
              color: isDark ? "rgba(148,163,184,0.45)" : "rgba(30,41,59,0.45)",
              background: "none", cursor: "pointer", userSelect: "none", padding: 12,
            }}
          >✕</button>

          {/* ── Left: Nav links ── */}
          <nav style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, flexShrink: 0 }}>
            {NAV_LINKS.map(({ to, label: lbl, accent }) => {
              const active = location.pathname === to;
              return (
                <button
                  key={to}
                  className="nav-link-btn"
                  onClick={() => goTo(to)}
                  onMouseEnter={(e) => {
                    linkIn(e);
                    e.currentTarget.querySelector(".nav-text").style.background = `linear-gradient(120deg,${isDark?"#f1f5f9":"#0f172a"} 20%,${accent} 100%)`;
                    e.currentTarget.querySelector(".nav-text").style.WebkitBackgroundClip = "text";
                    e.currentTarget.querySelector(".nav-text").style.WebkitTextFillColor  = "transparent";
                  }}
                  onMouseLeave={(e) => {
                    linkOut(e);
                    const bg = active
                      ? `linear-gradient(120deg,${isDark?"#f1f5f9":"#0f172a"} 20%,${accent} 100%)`
                      : `linear-gradient(120deg,${isDark?"rgba(241,245,249,0.5)":"rgba(15,23,42,0.4)"},${isDark?"rgba(241,245,249,0.32)":"rgba(15,23,42,0.25)"})`;
                    e.currentTarget.querySelector(".nav-text").style.background = bg;
                    e.currentTarget.querySelector(".nav-text").style.WebkitBackgroundClip = "text";
                    e.currentTarget.querySelector(".nav-text").style.WebkitTextFillColor  = "transparent";
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 16, background: "none", cursor: "pointer" }}
                >
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                    background: active ? accent : "transparent",
                    boxShadow: active ? `0 0 12px ${accent}` : "none",
                    border: active ? "none" : `1px solid ${accent}40`,
                    transition: "all 0.25s",
                  }} />
                  <span
                    className="nav-text"
                    style={{
                      fontSize:    "clamp(44px, 7.5vw, 84px)",
                      fontFamily:  "'Orbitron', sans-serif",
                      fontWeight:  800, letterSpacing: "0.06em",
                      lineHeight:  1, textTransform: "uppercase",
                      background: active
                        ? `linear-gradient(120deg,${isDark?"#f1f5f9":"#0f172a"} 20%,${accent} 100%)`
                        : `linear-gradient(120deg,${isDark?"rgba(241,245,249,0.5)":"rgba(15,23,42,0.4)"},${isDark?"rgba(241,245,249,0.32)":"rgba(15,23,42,0.25)"})`,
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}
                  >{lbl}</span>
                </button>
              );
            })}

            {/* Divider */}
            <div style={{ width: 180, height: 1, margin: "12px 0 12px 23px", background: divColor }} />

            {/* Logout */}
            <button
              className="nav-link-btn"
              onClick={logout}
              onMouseEnter={(e) => { linkIn(e); e.currentTarget.querySelector(".logout-text").style.color = "#f87171"; }}
              onMouseLeave={(e) => { linkOut(e); e.currentTarget.querySelector(".logout-text").style.color = "rgba(248,113,113,0.35)"; }}
              style={{ display: "flex", alignItems: "center", gap: 16, background: "none", cursor: "pointer" }}
            >
              <div style={{ width: 7, height: 7, flexShrink: 0 }} />
              <span className="logout-text" style={{
                fontSize: "clamp(28px, 4vw, 46px)",
                fontFamily: "'Orbitron', sans-serif", fontWeight: 700,
                letterSpacing: "-0.02em", lineHeight: 1, textTransform: "uppercase",
                color: "rgba(248,113,113,0.35)", transition: "color 0.25s",
              }}>Logout</span>
            </button>
          </nav>

          {/* ── Right: Settings panel ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative", zIndex: 1 }}>

            {/* ── Theme picker ── */}
            <div className="settings-anim">
              <p style={{
                fontSize: 8, letterSpacing: "0.42em", fontFamily: "'DM Mono',monospace",
                color: labelColor, marginBottom: 12, fontWeight: 700,
              }}>▸ THEME</p>
              <div style={{ display: "flex", gap: 10 }}>
                {THEME_OPTIONS.map(opt => {
                  const isActive = theme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setTheme(opt.id)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        padding: "14px 18px", borderRadius: 14, cursor: "pointer", minWidth: 80,
                        background: isActive ? `${opt.color}14` : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                        border: `1.5px solid ${isActive ? opt.color : divColor}`,
                        boxShadow: isActive ? `0 0 22px ${opt.color}28, 0 0 44px ${opt.color}0d` : "none",
                        transform: isActive ? "scale(1.07)" : "scale(1)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = `${opt.color}0d`; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"; }}
                    >
                      <span style={{ fontSize: 20, color: isActive ? opt.color : labelColor, transition: "color 0.3s" }}>
                        {opt.icon}
                      </span>
                      <span style={{
                        fontSize: 9, fontWeight: 800, letterSpacing: "0.18em",
                        fontFamily: "'Orbitron',sans-serif",
                        color: isActive ? opt.color : (isDark ? "rgba(148,163,184,0.45)" : "rgba(30,41,59,0.45)"),
                        transition: "color 0.3s",
                      }}>{opt.label}</span>
                      <span style={{
                        fontSize: 7.5, letterSpacing: "0.2em", fontFamily: "'DM Mono',monospace",
                        color: isActive ? `${opt.color}80` : labelColor, transition: "color 0.3s",
                      }}>{opt.desc}</span>
                      {isActive && (
                        <div style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: opt.color, boxShadow: `0 0 8px ${opt.color}`,
                          animation: "livepulse 1.5s ease-in-out infinite",
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: divColor }} className="settings-anim" />

            {/* ── Digital Writing toggle ── */}
            <div className="settings-anim">
              <p style={{
                fontSize: 8, letterSpacing: "0.42em", fontFamily: "'DM Mono',monospace",
                color: labelColor, marginBottom: 12, fontWeight: 700,
              }}>▸ WRITING EFFECT</p>
              <button
                onClick={toggleTypewriter}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "13px 18px", borderRadius: 12, cursor: "pointer",
                  background: typewriterEnabled
                    ? "rgba(34,211,238,0.1)"
                    : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                  border: `1.5px solid ${typewriterEnabled ? "rgba(34,211,238,0.35)" : divColor}`,
                  boxShadow: typewriterEnabled ? "0 0 24px rgba(34,211,238,0.18)" : "none",
                  transition: "all 0.3s ease",
                  width: "100%",
                }}
                onMouseEnter={e => { if (!typewriterEnabled) e.currentTarget.style.background = "rgba(34,211,238,0.06)"; }}
                onMouseLeave={e => { if (!typewriterEnabled) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"; }}
              >
                {/* Pill switch */}
                <div style={{
                  width: 44, height: 24, borderRadius: 999, flexShrink: 0,
                  background: typewriterEnabled ? "rgba(34,211,238,0.22)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"),
                  border: `1px solid ${typewriterEnabled ? "rgba(34,211,238,0.4)" : divColor}`,
                  position: "relative", transition: "all 0.3s ease",
                }}>
                  <div style={{
                    position: "absolute", top: 4,
                    left: typewriterEnabled ? 22 : 4,
                    width: 15, height: 15, borderRadius: "50%",
                    background: typewriterEnabled ? "#22d3ee" : (isDark ? "rgba(148,163,184,0.35)" : "rgba(30,41,59,0.3)"),
                    boxShadow: typewriterEnabled ? "0 0 10px rgba(34,211,238,0.9)" : "none",
                    transition: "all 0.3s ease",
                  }} />
                </div>
                {/* Label */}
                <div>
                  <p style={{
                    fontSize: 11, fontWeight: 800, letterSpacing: "0.1em",
                    fontFamily: "'Orbitron',sans-serif",
                    color: typewriterEnabled ? "#22d3ee" : (isDark ? "rgba(203,213,225,0.65)" : "rgba(30,41,59,0.65)"),
                    margin: "0 0 3px", transition: "color 0.3s",
                  }}>Digital Writing</p>
                  <p style={{
                    fontSize: 8, letterSpacing: "0.22em", fontFamily: "'DM Mono',monospace",
                    color: typewriterEnabled ? "rgba(34,211,238,0.55)" : labelColor,
                    margin: 0, transition: "color 0.3s",
                  }}>
                    {typewriterEnabled ? "◈ TYPEWRITER ACTIVE" : "○ TYPEWRITER OFF"}
                  </p>
                </div>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default PageHeader;
