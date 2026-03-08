/**
 * StreakCard.jsx — Redesigned
 * Reads streak from the shared StreakContext (no separate API call).
 * Displays a glowing flame card with current/longest streak.
 */
import { useStreak } from "../layout/StreakContext";

const StreakCard = () => {
  const { current, longest } = useStreak();

  if (!current && !longest) return null;

  return (
    <div
      style={{
        background:   "rgba(251,191,36,0.06)",
        border:       "1px solid rgba(251,191,36,0.18)",
        borderRadius: 18,
        padding:      "20px 24px",
        position:     "relative",
        overflow:     "hidden",
        boxShadow:    "0 4px 32px rgba(251,191,36,0.08)",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 140, height: 140, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)",
        filter: "blur(20px)", pointerEvents: "none",
      }} />

      {/* Header */}
      <p style={{
        fontSize: 9, letterSpacing: "0.35em", margin: "0 0 12px",
        fontFamily: "'DM Mono', monospace", color: "rgba(251,191,36,0.5)",
      }}>▸ STREAK</p>

      {/* Current streak */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 32, lineHeight: 1 }}>🔥</span>
        <div>
          <div style={{
            fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1,
            fontFamily: "var(--font-display)",
            background: "linear-gradient(120deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{current}</div>
          <div style={{
            fontSize: 9, letterSpacing: "0.3em", color: "rgba(251,191,36,0.45)",
            fontFamily: "'DM Mono', monospace", marginTop: 2,
          }}>DAY STREAK</div>
        </div>
      </div>

      {/* Longest */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", borderRadius: 10,
        background: "rgba(251,191,36,0.06)",
        border: "1px solid rgba(251,191,36,0.1)",
      }}>
        <span style={{ fontSize: 9, letterSpacing: "0.2em", fontFamily: "'DM Mono', monospace",
          color: "rgba(148,163,184,0.4)" }}>LONGEST</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#fbbf24",
          fontFamily: "'DM Mono', monospace" }}>🏆 {longest} days</span>
      </div>
    </div>
  );
};

export default StreakCard;