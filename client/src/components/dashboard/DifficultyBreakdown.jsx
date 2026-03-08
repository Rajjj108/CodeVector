import { useEffect, useRef } from "react";
import gsap from "gsap";

/* ── SVG ring ── */
const Ring = ({ pct, color, size = 96, stroke = 7 }) => {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(pct, 1))}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)" }} />
    </svg>
  );
};

/* ── Individual card ── */
const DiffCard = ({ label, data, color, delay = 0 }) => {
  const cardRef = useRef(null);
  const numRef  = useRef(null);
  const ringRef = useRef(null);
  const glowRef = useRef(null);
  const tlRef   = useRef(null); // track active timeline to kill on fast hover

  const pct   = data.total > 0 ? data.solved / data.total : 0;
  const emoji = label === "Easy" ? "🟢" : label === "Medium" ? "🟡" : "🔴";

  /* ── Mount entrance ── */
  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 28, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "expo.out", delay }
    );
    // Ring starts hidden, numbers start visible — set hard so there's no ambiguity
    gsap.set(ringRef.current, { opacity: 0, scale: 0.85, y: 14, filter: "blur(6px)" });
    gsap.set(numRef.current,  { opacity: 1, y: 0, filter: "blur(0px)" });
  }, [delay]);

  /* ── Shared cleanup — kills everything and snaps to a clean known state ── */
  const killAll = () => {
    if (tlRef.current) tlRef.current.kill();
    gsap.killTweensOf([numRef.current, ringRef.current, glowRef.current, cardRef.current]);
  };

  /* ── Hover in ── */
  const onEnter = () => {
    killAll();

    gsap.to(cardRef.current, {
      y: -6,
      boxShadow: `0 16px 48px ${color}22, 0 0 0 1px ${color}55`,
      duration: 0.28, ease: "power3.out",
    });
    gsap.to(glowRef.current, { opacity: 1, scale: 1.2, duration: 0.5, ease: "power2.out" });

    const tl = gsap.timeline();
    tlRef.current = tl;

    tl.to(numRef.current, {
      opacity: 0, y: -20, filter: "blur(5px)",
      duration: 0.2, ease: "power2.in",
    });
    tl.fromTo(ringRef.current,
      { opacity: 0, y: 16, scale: 0.85, filter: "blur(6px)" },
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.38, ease: "back.out(1.7)" },
      "-=0.05"
    );
  };

  /* ── Hover out ── */
  const onLeave = () => {
    killAll();

    gsap.to(cardRef.current, { y: 0, boxShadow: "none", duration: 0.32, ease: "power3.out" });
    gsap.to(glowRef.current, { opacity: 0, scale: 1, duration: 0.4, ease: "power2.in" });

    const tl = gsap.timeline();
    tlRef.current = tl;

    // Always snap ring to hidden first so it can't ghost
    tl.set(ringRef.current, { opacity: 0, y: 14, scale: 0.88, filter: "blur(5px)" });
    tl.fromTo(numRef.current,
      { opacity: 0, y: 16, filter: "blur(5px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.32, ease: "expo.out" }
    );
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        flex: 1,
        minHeight: 192,
        background: "rgba(9,11,12,0.85)",
        border: "1px solid rgba(117,130,145,0.25)",
        borderRadius: 16,
        backdropFilter: "blur(18px)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 18px",
        cursor: "default",
        userSelect: "none",
      }}
    >
      {/* top shimmer */}
      <div style={{
        position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
        background: `linear-gradient(90deg,transparent,${color}50,transparent)`,
        pointerEvents: "none",
      }} />

      {/* ambient glow */}
      <div ref={glowRef} style={{
        position: "absolute",
        width: 160, height: 160, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}1a 0%, transparent 70%)`,
        top: "50%", left: "50%",
        transform: "translate(-50%,-50%) scale(1)",
        opacity: 0, pointerEvents: "none",
      }} />

      {/* label + emoji */}
      <span style={{
        position: "absolute", top: 13, left: 15,
        fontSize: 9, letterSpacing: "0.28em",
        color: `${color}90`,
        fontFamily: "'DM Mono', monospace",
        textTransform: "uppercase", fontWeight: 700,
      }}>{label}</span>
      <span style={{ position: "absolute", top: 10, right: 13, fontSize: 14 }}>{emoji}</span>

      {/* ── NUMBER VIEW ── */}
      <div ref={numRef} style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
        <p style={{
          fontSize: 60, fontWeight: 900, lineHeight: 1,
          margin: "0 0 4px", color,
          fontFamily: "var(--font-display,'DM Mono',monospace)",
          letterSpacing: "-0.05em",
          filter: `drop-shadow(0 0 22px ${color}55)`,
        }}>{data.solved}</p>

        <p style={{
          margin: "0 0 16px", fontSize: 11,
          color: "rgba(139,148,158,0.55)",
          fontFamily: "'DM Mono',monospace",
          letterSpacing: "0.1em",
        }}>
          / {data.total || "—"} total
        </p>

        <div style={{
          width: 108, height: 3, borderRadius: 99,
          background: "rgba(255,255,255,0.06)",
          overflow: "hidden", margin: "0 auto",
        }}>
          <div style={{
            height: "100%", borderRadius: 99,
            width: `${Math.round(pct * 100)}%`,
            background: `linear-gradient(90deg,${color}99,${color})`,
            boxShadow: `0 0 8px ${color}77`,
            transition: "width 1.3s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>

        <p style={{
          margin: "8px 0 0", fontSize: 10,
          color: `${color}99`,
          fontFamily: "'DM Mono',monospace",
          letterSpacing: "0.18em",
        }}>
          {data.total > 0 ? `${Math.round(pct * 100)}%` : "—"} done
        </p>
      </div>

      {/* ── RING VIEW (hidden until hover) ── */}
      <div ref={ringRef} style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        zIndex: 2,
      }}>
        <div style={{ position: "relative" }}>
          <Ring pct={pct} color={color} size={100} stroke={8} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontSize: 17, fontWeight: 900, color,
              fontFamily: "'DM Mono',monospace",
              filter: `drop-shadow(0 0 8px ${color})`,
            }}>
              {data.total > 0 ? `${Math.round(pct * 100)}%` : "—"}
            </span>
          </div>
        </div>

        <p style={{
          margin: "12px 0 2px", fontSize: 13, fontWeight: 700, color,
          fontFamily: "'DM Mono',monospace", letterSpacing: "0.06em",
        }}>
          {data.solved}{" "}
          <span style={{ color: "rgba(139,148,158,0.45)", fontWeight: 400 }}>
            / {data.total || "—"}
          </span>
        </p>
        <p style={{
          margin: 0, fontSize: 9,
          color: "rgba(139,148,158,0.4)",
          fontFamily: "'DM Mono',monospace",
          letterSpacing: "0.22em", textTransform: "uppercase",
        }}>problems solved</p>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════ */
const DifficultyBreakdown = ({ easy, medium, hard, totalSolved, totalProblems }) => {
  const headerRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { opacity: 0, x: -14 },
      { opacity: 1, x: 0, duration: 0.5, ease: "expo.out", delay: 0.1 }
    );
  }, []);

  return (
    <div style={{
      background: "rgba(9,11,12,0.82)",
      border: "1px solid rgba(117,130,145,0.25)",
      borderRadius: 18,
      backdropFilter: "blur(18px)",
      padding: "22px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: "8%", right: "8%", height: 1,
        background: "linear-gradient(90deg,transparent,rgba(0,229,160,0.2),transparent)",
        pointerEvents: "none",
      }} />

      <div ref={headerRef} style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#00e5a0", filter: "drop-shadow(0 0 6px #00e5a0)" }}>◎</span>
          <p style={{
            fontSize: 15, fontWeight: 700, color: "#e6edf3", margin: 0,
            fontFamily: "var(--font-display,'DM Mono',monospace)",
          }}>Difficulty Breakdown</p>
          <div style={{ width: 80, height: 1, background: "linear-gradient(90deg,#00e5a035,transparent)" }} />
        </div>

        <div style={{
          padding: "5px 14px", borderRadius: 8,
          background: "rgba(0,229,160,0.07)",
          border: "1px solid rgba(0,229,160,0.2)",
          fontSize: 10, color: "rgba(0,229,160,0.65)",
          fontFamily: "'DM Mono',monospace",
          letterSpacing: "0.18em",
        }}>
          {totalSolved} / {totalProblems}
        </div>
      </div>

      <p style={{
        margin: "0 0 16px", fontSize: 9,
        color: "rgba(139,148,158,0.3)",
        fontFamily: "'DM Mono',monospace",
        letterSpacing: "0.22em", textTransform: "uppercase", textAlign: "right",
      }}>
        hover card to see ring ↗
      </p>

      <div style={{ display: "flex", gap: 12 }}>
        <DiffCard label="Easy"   data={easy}   color="#00e5a0" delay={0.15} />
        <DiffCard label="Medium" data={medium} color="#e3b341" delay={0.25} />
        <DiffCard label="Hard"   data={hard}   color="#f85149" delay={0.35} />
      </div>
    </div>
  );
};

export default DifficultyBreakdown;