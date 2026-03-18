/**
 * SolvedStats — shared across Dashboard and DsaTracker header
 * Fetches real easy/medium/hard counts from /api/dashboard/summary
 * and renders the 3 difficulty cards + overall progress bar.
 */
import { useState, useEffect } from "react";
import axios from "axios";

const DIFF = {
  easy:   { label: "EASY",   color: "#34d399", glow: "rgba(52,211,153,0.45)",  border: "rgba(52,211,153,0.35)",  icon: "⚡" },
  medium: { label: "MEDIUM", color: "#fbbf24", glow: "rgba(251,191,36,0.45)",  border: "rgba(251,191,36,0.35)",  icon: "◉" },
  hard:   { label: "HARD",   color: "#f87171", glow: "rgba(248,113,113,0.45)", border: "rgba(248,113,113,0.35)", icon: "☰" },
};

// Total questions on CodeVector (static reference)
const TOTALS = { easy: 869, medium: 1829, hard: 815 };

const SolvedStats = ({ compact = false, refreshTrigger = 0 }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/dashboard/summary", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch(console.error);
  }, [refreshTrigger]);

  const totalSolved = stats?.totalSolved ?? 0;
  const easy        = stats?.easy?.solved   ?? 0;
  const medium      = stats?.medium?.solved ?? 0;
  const hard        = stats?.hard?.solved   ?? 0;
  const totalAll    = TOTALS.easy + TOTALS.medium + TOTALS.hard;
  const pct         = totalAll > 0 ? Math.round((totalSolved / totalAll) * 100) : 0;

  const cards = [
    { ...DIFF.easy,   solved: easy,   total: TOTALS.easy   },
    { ...DIFF.medium, solved: medium, total: TOTALS.medium  },
    { ...DIFF.hard,   solved: hard,   total: TOTALS.hard    },
  ];

  if (compact) {
    // Inline pill row for the DsaTracker header area
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 22, fontWeight: 900, fontFamily: "var(--font-display)",
          color: "#e6edf3", letterSpacing: "-0.02em",
        }}>
          {totalSolved}
          <span style={{ fontSize: 14, color: "rgba(230,237,243,0.45)", fontWeight: 400 }}>
            {" "}/ {totalAll} SOLVED
          </span>
        </span>
        {cards.map(({ label, color, solved, total }) => (
          <span key={label} style={{
            fontSize: 11, fontFamily: "'DM Mono',monospace", fontWeight: 700,
            color, letterSpacing: "0.05em",
          }}>
            {label[0]}{label.slice(1).toLowerCase()} {solved}/{total}
          </span>
        ))}
        <span style={{
          fontSize: 11, fontFamily: "'DM Mono',monospace",
          color: "#00e5a0", letterSpacing: "0.1em",
        }}>
          {pct}%
        </span>
      </div>
    );
  }

  // Full card layout (used in DsaTracker hero + standalone)
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Hero banner */}
      <div className="stat-card" style={{
        background: "rgba(10,20,18,0.95)",
        border: "1px solid rgba(0,229,160,0.35)",
        borderRadius: 12,
        padding: "24px 28px",
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 0 40px rgba(0,229,160,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent,rgba(0,229,160,0.7),rgba(88,166,255,0.4),transparent)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.03,
          backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)",
          backgroundSize: "24px 24px" }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 9, letterSpacing: "0.45em", color: "rgba(0,229,160,0.7)",
              fontFamily: "'DM Mono',monospace", margin: "0 0 6px", fontWeight: 700 }}>
              ▸ SYSTEM STATUS: ACTIVE
            </p>
            <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, lineHeight: 1,
              fontFamily: "'Orbitron',sans-serif", letterSpacing: "0.04em",
              background: "linear-gradient(120deg,#e6edf3 30%,#00e5a0 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              DSA TRACKER
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 28, fontWeight: 900, margin: 0, color: "#e6edf3",
              fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
              {totalSolved}{" "}
              <span style={{ fontSize: 14, color: "rgba(230,237,243,0.55)", fontWeight: 400 }}>
                / {totalAll} SOLVED
              </span>
            </p>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#00e5a0", margin: "2px 0 0",
              fontFamily: "'DM Mono',monospace", letterSpacing: "0.1em" }}>
              {pct}% COMPLETION
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 18 }}>
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`, borderRadius: 999,
              background: "linear-gradient(90deg,#00b87a,#00e5a0,#58a6ff)",
              boxShadow: "0 0 14px rgba(0,229,160,0.5)",
              transition: "width 1.2s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
          </div>
        </div>
      </div>

      {/* Difficulty cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {cards.map(({ label, solved, total, color, glow, border, icon }) => {
          const cardPct = total === 0 ? 0 : Math.round((solved / total) * 100);
          return (
            <div key={label} className="stat-card" style={{
              background: "rgba(14,10,30,0.9)",
              border: `1px solid ${border}`,
              borderRadius: 12,
              padding: "18px 20px",
              position: "relative",
              overflow: "hidden",
              boxShadow: `0 0 0 1px ${color}10, 0 4px 24px rgba(0,0,0,0.4)`,
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg,transparent,${color}80,transparent)` }} />
              <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60,
                background: `radial-gradient(circle at top right,${color}18,transparent 70%)`,
                pointerEvents: "none" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 8, letterSpacing: "0.35em", color: `${color}99`,
                    fontFamily: "'DM Mono',monospace", margin: "0 0 6px", fontWeight: 700 }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 28, fontWeight: 900, margin: 0, color: "#f1f5f9",
                    fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                    {cardPct}%{" "}
                    <span style={{ fontSize: 12, color: "rgba(148,163,184,0.45)", fontWeight: 400 }}>
                      {solved}/{total}
                    </span>
                  </p>
                </div>
                <span style={{ fontSize: 18, filter: `drop-shadow(0 0 8px ${glow})`, color, opacity: 0.8 }}>
                  {icon}
                </span>
              </div>

              <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${cardPct}%`, borderRadius: 999,
                  background: color, boxShadow: `0 0 8px ${glow}`,
                  transition: "width 1s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SolvedStats;
