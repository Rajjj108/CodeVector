/**
 * AppBackground.jsx — Theme-aware version
 * Orb colors & base background shift with the current theme.
 */
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useTheme } from "./layout/ThemeContext";

/* Per-theme orb configs */
const ORB_SETS = {
  cyber: [
    { color: "rgba(4,217,160,0.32)",  size: "90vw", blur: "80px", duration: 18, path: [{ x:"-15%",y:"-15%"},{x:"45%",y:"10%"},{x:"85%",y:"45%"},{x:"40%",y:"85%"},{x:"-5%",y:"55%"},{x:"-15%",y:"-15%"}] },
    { color: "rgba(4,217,160,0.26)",   size: "80vw", blur: "90px", duration: 26, path: [{ x:"75%",y:"70%"},{x:"90%",y:"5%"},{x:"25%",y:"-10%"},{x:"-10%",y:"35%"},{x:"20%",y:"95%"},{x:"75%",y:"70%"}] },
    { color: "rgba(4,217,160,0.22)", size: "65vw", blur: "70px", duration: 14, path: [{ x:"95%",y:"15%"},{x:"55%",y:"55%"},{x:"5%",y:"85%"},{x:"45%",y:"45%"},{x:"95%",y:"15%"}] },
    { color: "rgba(4,217,160,0.20)",  size: "70vw", blur: "85px", duration: 32, path: [{ x:"50%",y:"105%"},{x:"-5%",y:"50%"},{x:"50%",y:"-5%"},{x:"105%",y:"50%"},{x:"50%",y:"105%"}] },
    { color: "rgba(4,217,160,0.14)",  size: "55vw", blur: "75px", duration: 22, path: [{ x:"85%",y:"-10%"},{x:"105%",y:"25%"},{x:"70%",y:"50%"},{x:"105%",y:"75%"},{x:"85%",y:"-10%"}] },
  ],
  night: [
    { color: "rgba(4,217,160,0.35)",   size: "90vw", blur: "90px", duration: 22, path: [{ x:"-15%",y:"-15%"},{x:"45%",y:"10%"},{x:"85%",y:"45%"},{x:"40%",y:"85%"},{x:"-5%",y:"55%"},{x:"-15%",y:"-15%"}] },
    { color: "rgba(4,217,160,0.28)",   size: "80vw", blur: "95px", duration: 30, path: [{ x:"75%",y:"70%"},{x:"90%",y:"5%"},{x:"25%",y:"-10%"},{x:"-10%",y:"35%"},{x:"20%",y:"95%"},{x:"75%",y:"70%"}] },
    { color: "rgba(4,217,160,0.18)",  size: "65vw", blur: "75px", duration: 18, path: [{ x:"95%",y:"15%"},{x:"55%",y:"55%"},{x:"5%",y:"85%"},{x:"45%",y:"45%"},{x:"95%",y:"15%"}] },
    { color: "rgba(4,217,160,0.14)",  size: "70vw", blur: "85px", duration: 36, path: [{ x:"50%",y:"105%"},{x:"-5%",y:"50%"},{x:"50%",y:"-5%"},{x:"105%",y:"50%"},{x:"50%",y:"105%"}] },
    { color: "rgba(4,217,160,0.12)", size: "55vw", blur: "80px", duration: 24, path: [{ x:"85%",y:"-10%"},{x:"105%",y:"25%"},{x:"70%",y:"50%"},{x:"105%",y:"75%"},{x:"85%",y:"-10%"}] },
  ],
  
};

const BG_BASE = {
  cyber: "#03040c",
  night: "#060810",
};

const OVERLAY = {
  cyber: `radial-gradient(ellipse 110% 55% at 0% 0%, rgba(75,25,170,0.18) 0%, transparent 60%),
          radial-gradient(ellipse 80% 80% at 100% 100%, rgba(0,110,170,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 60% 60% at 50% 50%, rgba(15,8,40,0.5) 0%, transparent 100%)`,
  night: `radial-gradient(ellipse 110% 55% at 0% 0%, rgba(15,23,42,0.7) 0%, transparent 60%),
          radial-gradient(ellipse 80% 80% at 100% 100%, rgba(15,23,42,0.5) 0%, transparent 60%)`,
};

const AppBackground = ({ contained = false }) => {
  const { theme } = useTheme();
  const orbRefs   = useRef([]);
  const wrapRef   = useRef(null);

  const orbs = ORB_SETS[theme] || ORB_SETS.cyber;

  useEffect(() => {
    orbRefs.current.forEach((el, i) => {
      if (!el || !orbs[i]) return;
      gsap.killTweensOf(el);
      const tl = gsap.timeline({ repeat: -1 });
      orbs[i].path.slice(1).forEach((pt) => {
        tl.to(el, { left: pt.x, top: pt.y, duration: orbs[i].duration / (orbs[i].path.length - 1), ease: "sine.inOut" });
      });
    });
  }, [theme]);

  return (
    <div
      ref={wrapRef}
      style={{
        position:      contained ? "absolute" : "fixed",
        inset:         0,
        zIndex:        0,
        pointerEvents: "none",
        background:    contained ? "transparent" : BG_BASE[theme],
        overflow:      "hidden",
        transition:    "background 0.45s ease",
      }}
    >
      {orbs.map((cfg, i) => (
        <div
          key={`${theme}-${i}`}
          ref={el => { orbRefs.current[i] = el; }}
          className="no-theme-transition"
          style={{
            position:     "absolute",
            left:         cfg.path[0].x,
            top:          cfg.path[0].y,
            width:        cfg.size,
            height:       cfg.size,
            transform:    "translate(-50%, -50%)",
            borderRadius: "50%",
            background:   `radial-gradient(circle, ${cfg.color} 0%, transparent 68%)`,
            filter:       `blur(${cfg.blur})`,
            willChange:   "left, top",
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div style={{ position: "absolute", inset: 0, background: OVERLAY[theme], transition: "background 0.5s ease" }} />

      {/* Film grain */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: theme === "day" ? 0.012 : 0.025,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat", backgroundSize: "128px 128px",
        transition: "opacity 0.4s ease",
      }} />
    </div>
  );
};

export default AppBackground;
