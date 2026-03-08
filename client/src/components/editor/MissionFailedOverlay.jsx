/**
 * MissionFailedOverlay.jsx
 *
 * Renders via portal on document.body at z-index 99999 (above the B&W wave).
 * The wave desaturates everything below; this overlay stays fully colorful.
 */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

const KF_ID = "mfo-v3-kf";
if (typeof document !== "undefined" && !document.getElementById(KF_ID)) {
  const s = document.createElement("style");
  s.id = KF_ID;
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

    @keyframes mfo-pulse {
      0%,100% { box-shadow: 0 0 20px rgba(239,68,68,0.5), 0 32px 80px rgba(0,0,0,0.7); }
      50%      { box-shadow: 0 0 44px rgba(239,68,68,0.9), 0 32px 80px rgba(0,0,0,0.7); }
    }
    @keyframes mfo-scanline {
      from { transform: translateY(-100%); }
      to   { transform: translateY(100%); }
    }
    @keyframes mfo-bar-drain {
      from { width: 100%; }
      to   { width: 0%; }
    }
    @keyframes mfo-cursor {
      0%,100%{ opacity:1 } 50%{ opacity:0 }
    }
    @keyframes mfo-noise {
      0%  { background-position: 0    0    }
      25% { background-position: -10% -5%  }
      50% { background-position:  5%  10%  }
      75% { background-position: -5%   5%  }
      100%{ background-position:  0    0   }
    }
  `;
  document.head.appendChild(s);
}

const MissionFailedOverlay = ({ visible, onDismiss }) => {
  const [rendered, setRendered] = useState(false);

  const overlayRef   = useRef(null);
  const flashRef     = useRef(null);
  const cardRef      = useRef(null);
  const iconRef      = useRef(null);
  const lettersRef   = useRef([]);
  const subRef       = useRef(null);
  const barRef       = useRef(null);
  const autoTimer    = useRef(null);

  useEffect(() => { if (visible) setRendered(true); }, [visible]);

  useEffect(() => {
    if (!rendered || !visible) return;

    const raf = requestAnimationFrame(() => {
      const tl = gsap.timeline();

      /* 1 — red flash */
      tl.fromTo(flashRef.current,
        { opacity: 0.9 },
        { opacity: 0, duration: 0.4, ease: "expo.out" }
      );

      /* 2 — overlay bg in */
      tl.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
        "-=0.3"
      );

      /* 3 — card slides up from below */
      tl.fromTo(cardRef.current,
        { y: "60%", opacity: 0, scale: 0.92 },
        { y: "0%",  opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.5)" },
        "-=0.05"
      );

      /* 4 — icon elastic pop */
      tl.fromTo(iconRef.current,
        { scale: 0, rotate: -20, opacity: 0 },
        { scale: 1, rotate:  0,  opacity: 1, duration: 0.6, ease: "elastic.out(1.1,0.5)" },
        "-=0.35"
      );

      /* 5 — letter stagger */
      const letters = lettersRef.current.filter(Boolean);
      if (letters.length) {
        tl.fromTo(letters,
          { opacity: 0, y: 24, filter: "blur(6px)" },
          { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.5, stagger: 0.032, ease: "expo.out" },
          "-=0.25"
        );
      }

      /* 6 — subtext + bar */
      tl.fromTo(subRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "-=0.1"
      );

      /* 7 — start countdown bar */
      if (barRef.current) barRef.current.style.animationPlayState = "running";

      /* 8 — panel shake */
      if (overlayRef.current?.parentElement) {
        gsap.timeline()
          .to(overlayRef.current.parentElement, { x: -9, duration: 0.05 })
          .to(overlayRef.current.parentElement, { x:  8, duration: 0.05 })
          .to(overlayRef.current.parentElement, { x: -6, duration: 0.05 })
          .to(overlayRef.current.parentElement, { x:  5, duration: 0.05 })
          .to(overlayRef.current.parentElement, { x: -4, duration: 0.05 })
          .to(overlayRef.current.parentElement, { x:  3, duration: 0.05 })
          .to(overlayRef.current.parentElement, { x:  0, duration: 0.09 });
      }

      autoTimer.current = setTimeout(handleDismiss, 5000);
    });

    return () => { cancelAnimationFrame(raf); clearTimeout(autoTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendered, visible]);

  const handleDismiss = () => {
    clearTimeout(autoTimer.current);
    gsap.to([cardRef.current, overlayRef.current], {
      opacity: 0, y: 16, duration: 0.35, ease: "power2.in",
      onComplete: () => { setRendered(false); onDismiss?.(); },
    });
  };

  if (!rendered) return null;

  const MESSAGE = "NOT ENOUGH TIME";

  const overlay = (
    <div
      ref={overlayRef}
      onClick={handleDismiss}
      style={{
        position:       "fixed",
        inset:          0,
        zIndex:         99999,      /* above the B&W wave (9998) — stays colorful */
        cursor:         "pointer",
        pointerEvents:  "auto",
        background:     "rgba(3,4,12,0.55)",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        overflow:       "hidden",
      }}
    >
      {/* Red flash layer */}
      <div ref={flashRef} style={{
        position: "absolute", inset: 0, background: "rgba(239,68,68,0.72)",
        zIndex: 0, pointerEvents: "none",
      }} />

      {/* Scanline sweep */}
      <div style={{ position:"absolute",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden" }}>
        <div style={{
          position:"absolute", left:0, right:0, height:90,
          background:"linear-gradient(180deg,transparent 0%,rgba(239,68,68,0.07) 50%,transparent 100%)",
          animation:"mfo-scanline 2.2s linear 0.5s 2",
        }} />
      </div>

      {/* Noise texture */}
      <div style={{
        position:"absolute",inset:0,zIndex:0,pointerEvents:"none",opacity:0.04,
        backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize:"160px 160px",
        animation:"mfo-noise 0.18s steps(1) infinite",
      }} />

      {/* ── Card ── */}
      <div
        ref={cardRef}
        style={{
          position:   "relative",
          zIndex:     1,
          width:      "min(520px, calc(100vw - 40px))",
          padding:    "28px 32px 24px",
          borderRadius: 16,
          background: "linear-gradient(135deg,rgba(15,5,5,0.98) 0%,rgba(30,8,8,0.96) 100%)",
          border:     "1px solid rgba(239,68,68,0.35)",
          animation:  "mfo-pulse 2s ease-in-out 0.9s infinite",
        }}
      >
        {/* Top accent line */}
        <div style={{
          position:"absolute",top:0,left:"10%",right:"10%",height:2,
          background:"linear-gradient(90deg,transparent,#ef4444,transparent)",
          borderRadius:2,
        }} />

        {/* Icon + title */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
          <div ref={iconRef} style={{
            width:52, height:52, borderRadius:14, flexShrink:0,
            background:"rgba(239,68,68,0.12)",
            border:"1.5px solid rgba(239,68,68,0.4)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:24,
          }}>⛔</div>

          <div style={{ display:"flex", flexWrap:"wrap", gap:0, alignItems:"baseline" }}>
            {MESSAGE.split("").map((ch, i) => (
              <span key={i} ref={el => { lettersRef.current[i] = el; }} style={{
                fontFamily:    "'Bebas Neue','Impact','Arial Narrow',sans-serif",
                fontSize:      "clamp(26px,5vw,42px)",
                letterSpacing: ch === " " ? "0.3em" : "0.05em",
                color:         "#f8fafc",
                textShadow:    "0 0 30px rgba(239,68,68,0.65), 0 2px 0 rgba(0,0,0,0.8)",
                lineHeight:    1,
                display:       "inline-block",
              }}>
                {ch === " " ? "\u00a0" : ch}
              </span>
            ))}
          </div>
        </div>

        <div style={{ height:1, marginBottom:14, background:"linear-gradient(90deg,rgba(239,68,68,0.45),rgba(239,68,68,0.06))" }} />

        <div ref={subRef} style={{ opacity:0 }}>
          <p style={{
            fontFamily:"'DM Mono',monospace", fontSize:11,
            color:"rgba(252,165,165,0.75)", letterSpacing:"0.15em", margin:"0 0 16px",
          }}>
            MINIMUM 1 MINUTE OF ACTIVE CODING REQUIRED
          </p>
          <div style={{ height:3, borderRadius:2, background:"rgba(239,68,68,0.12)", overflow:"hidden", marginBottom:12 }}>
            <div ref={barRef} style={{
              height:"100%",
              background:"linear-gradient(90deg,#ef4444,#fca5a5)",
              borderRadius:2,
              width:"100%",
              animation:"mfo-bar-drain 4.5s linear 0.8s forwards",
              animationPlayState:"paused",
            }} />
          </div>
          <p style={{
            fontFamily:"'DM Mono',monospace", fontSize:8,
            color:"rgba(148,163,184,0.28)", letterSpacing:"0.2em",
          }}>
            CLICK ANYWHERE TO DISMISS
            <span style={{ animation:"mfo-cursor 1s step-end infinite" }}> _</span>
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

export default MissionFailedOverlay;
