/**
 * ProblemCard — cyber edition
 * Visual: table-row style matching screenshot 2 (dark row, neon tags, colored status dot)
 * GSAP hover (lift + left glow) and click-to-editor: UNCHANGED
 * Status cycle on icon click: UNCHANGED
 */
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useRef } from "react";
import { getTopicStyle } from "./topicColors.js";

const DIFF_CONFIG = {
  easy:   { color: "#34d399", bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.3)"   },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.3)"   },
  hard:   { color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.3)"  },
};

const STATUS_CONFIG = {
  Solved:   { color: "#34d399", icon: "●", glow: "rgba(52,211,153,0.85)"    },
  Revision: { color: "#fbbf24", icon: "●", glow: "rgba(251,191,36,0.85)"    },
  Pending:  { color: "rgba(148,163,184,0.25)", icon: "○", glow: "transparent" },
};

const ProblemCard = ({ problem, updateStatus }) => {
  const navigate  = useNavigate();
  const cardRef   = useRef(null);
  const glowRef   = useRef(null);

  const diff       = DIFF_CONFIG[(problem.difficulty || "medium").toLowerCase()] || DIFF_CONFIG.medium;
  const status     = STATUS_CONFIG[problem.status] || STATUS_CONFIG.Pending;
  const topicStyle = getTopicStyle(problem.topic);
  const topicColor = topicStyle.color;

  /* ── GSAP hover: lift + left glow — unchanged ── */
  const onEnter = () => {
    gsap.to(cardRef.current, { y: -1, background: "rgba(124,58,237,0.07)", duration: 0.18, ease: "power2.out" });
    gsap.to(glowRef.current, { opacity: 1, duration: 0.22 });
  };
  const onLeave = () => {
    gsap.to(cardRef.current, { y: 0, background: "transparent", duration: 0.22, ease: "power2.out" });
    gsap.to(glowRef.current, { opacity: 0, duration: 0.22 });
  };

  /* ── Click to editor — unchanged ── */
  const goToEditor = (e) => {
    if (e.target.closest("[data-status-menu]")) return;
    navigate(`/editor/${problem.id}`);
  };

  /* ── Status cycle ── */
  const cycleStatus = (e) => {
    e.stopPropagation();
    const order = ["Pending", "Solved", "Revision"];
    const next  = order[(order.indexOf(problem.status || "Pending") + 1) % order.length];
    updateStatus(problem.id, next);
  };

  return (
    <div
      ref={cardRef}
      className="problem-row"
      onClick={goToEditor}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        display:        "grid",
        gridTemplateColumns: "52px 1fr 100px 160px 56px 64px",
        alignItems:     "center",
        gap:            12,
        padding:        "11px 18px",
        cursor:         "pointer",
        position:       "relative",
        borderBottom:   "1px solid rgba(124,58,237,0.1)",
        transition:     "background 0.18s",
        userSelect:     "none",
      }}
    >
      {/* Left hover glow bar */}
      <div ref={glowRef} style={{
        position:  "absolute", left: 0, top: 0, bottom: 0, width: 2,
        background: "#7c3aed",
        boxShadow:  "0 0 10px rgba(124,58,237,0.8)",
        opacity:    0,
        pointerEvents: "none",
        borderRadius: "2px 0 0 2px",
      }} />

      {/* # index */}
      <span style={{
        fontSize: 11, color: "rgba(148,163,184,0.35)",
        fontFamily: "'DM Mono',monospace", letterSpacing: "0.05em",
      }}>
        {String(problem.id || "—").padStart(3, "0")}
      </span>

      {/* Title */}
      <span style={{
        fontSize: 13, fontWeight: 600, color: "#e2e8f0",
        letterSpacing: "-0.01em",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {problem.title}
      </span>

      {/* Difficulty badge */}
      <span style={{
        fontSize: 8.5, fontWeight: 700, letterSpacing: "0.18em",
        padding: "3px 10px", borderRadius: 4,
        background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`,
        fontFamily: "'DM Mono',monospace",
        textAlign: "center",
      }}>
        {(problem.difficulty || "MEDIUM").toUpperCase()}
      </span>

      {/* Tags */}
      <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", overflow: "hidden" }}>
        {problem.topic && (
          <span style={{
            fontSize: 8, fontWeight: 700, letterSpacing: "0.1em",
            padding: "2px 6px", borderRadius: 3,
            background: `${topicColor}14`, color: `${topicColor}cc`,
            border: `1px solid ${topicColor}28`,
            fontFamily: "'DM Mono',monospace",
            whiteSpace: "nowrap",
          }}>
            {problem.topic}
          </span>
        )}
        {(problem.topics || problem.tags || []).filter(t => t !== problem.topic).slice(0, 1).map(tag => {
          const ts = getTopicStyle(tag);
          return (
            <span key={tag} style={{
              fontSize: 8, fontWeight: 600, letterSpacing: "0.08em",
              padding: "2px 6px", borderRadius: 3,
              background: `${ts.color}10`, color: `${ts.color}90`,
              border: `1px solid ${ts.color}20`,
              fontFamily: "'DM Mono',monospace",
              whiteSpace: "nowrap",
            }}>
              {tag}
            </span>
          );
        })}
      </div>

      {/* Status dot — click to cycle */}
      <div
        data-status-menu="true"
        onClick={cycleStatus}
        title="Click to cycle status"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: status.color,
          filter: status.glow !== "transparent" ? `drop-shadow(0 0 5px ${status.glow})` : "none",
          cursor: "pointer",
          transition: "transform 0.15s",
        }}
        onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.3, duration: 0.15 })}
        onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1,   duration: 0.15 })}
      >
        {status.icon}
      </div>

      {/* Arrow */}
      <span style={{ fontSize: 14, color: "rgba(124,58,237,0.3)", textAlign: "right" }}>›</span>
    </div>
  );
};

export default ProblemCard;