import { useEffect, useState, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import Loader from "../Loader";

const GOALS = ["Get into FAANG", "Crack Product Companies", "Ace System Design", "General Upskilling"];

const UserSummary = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef   = useRef(null);
  const statsRef  = useRef([]);
  const avatarRef = useRef(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
const res = await axios.get("http://localhost:5000/api/dashboard/summary", {
  headers: { Authorization: `Bearer ${token}` },
});
        setUser(res.data);
      } catch (err) {
        console.error("Summary fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  useEffect(() => {
    if (!user || !cardRef.current) return;
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .fromTo(cardRef.current,
        { opacity: 0, y: 20, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 }
      )
      .fromTo(avatarRef.current,
        { opacity: 0, scale: 0.7, rotate: -8 },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.55, ease: "back.out(2)" }, "-=0.4"
      )
      .fromTo(statsRef.current.filter(Boolean),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.07 }, "-=0.35"
      );

    const bar = document.getElementById("summary-progress-bar");
    if (bar) gsap.fromTo(bar, { width: "0%" }, { width: `${user.progress}%`, duration: 1.2, delay: 0.4, ease: "power3.out" });
  }, [user]);

  const PLAN_CONFIG = {
    pro:        { label: "PRO",        color: "#fbbf24", bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.25)"   },
    free:       { label: "FREE",       color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)"   },
    enterprise: { label: "ENTERPRISE", color: "#22d3ee", bg: "rgba(34,211,238,0.1)",   border: "rgba(34,211,238,0.25)"   },
  };

  if (loading) return <Loader size={20} />;
  if (!user)   return null;

  const plan     = PLAN_CONFIG[user.plan?.toLowerCase()] || PLAN_CONFIG.free;
  const initials = user.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "??";

  /* Normalise streak — may be number or { current, longest } */
  const currentStreak = typeof user.streak === "object" ? (user.streak?.current ?? 0) : (user.streak ?? 0);
  const longestStreak = typeof user.streak === "object" ? (user.streak?.longest ?? 0) : 0;
  const joinDate      = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const goal          = user.goal || GOALS[0];
  const rank          = user.rank || "Rookie";
  const totalSolved   = user.totalSolved ?? 0;
  const revision      = user.revision ?? 0;
  const pending       = user.pending ?? 0;

  /* Rank palette */
  const rankColor = rank === "Expert" ? "#fbbf24" : rank === "Intermediate" ? "#22d3ee" : "#a78bfa";

  return (
    <div ref={cardRef} style={{ fontFamily: "var(--font-display)", padding: "22px" }}>

      {/* ── Top row: avatar + name + badges ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
        <div ref={avatarRef} style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 16,
            background: "linear-gradient(135deg,#7c3aed,#a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 900, color: "#fff",
            boxShadow: "0 8px 24px rgba(139,92,246,0.4)",
          }}>{initials}</div>
          {/* Online dot */}
          <div style={{
            position: "absolute", bottom: -2, right: -2,
            width: 12, height: 12, borderRadius: "50%", background: "#22d3ee",
            border: "2.5px solid #03040c", boxShadow: "0 0 10px rgba(34,211,238,0.8)",
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#e2e8f0", margin: 0, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
              {user.name}
            </h2>
            <span style={{
              fontSize: 8.5, fontWeight: 800, letterSpacing: "0.15em",
              padding: "3px 9px", borderRadius: 8, fontFamily: "'DM Mono', monospace",
              background: plan.bg, color: plan.color, border: `1px solid ${plan.border}`,
            }}>{plan.label}</span>
            <span style={{
              fontSize: 8.5, fontWeight: 700, letterSpacing: "0.12em",
              padding: "3px 9px", borderRadius: 8, fontFamily: "'DM Mono', monospace",
              background: `${rankColor}14`, color: rankColor, border: `1px solid ${rankColor}30`,
            }}>{rank.toUpperCase()}</span>
          </div>
          <p style={{ fontSize: 11, color: "rgba(148,163,184,0.5)", fontFamily: "'DM Mono', monospace", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {user.email}
          </p>
          <p style={{ fontSize: 10, color: "rgba(148,163,184,0.3)", fontFamily: "'DM Mono', monospace", margin: 0 }}>
            🗓 Member since {joinDate}
          </p>
        </div>
      </div>

      {/* ── Goal banner ── */}
      <div style={{
        padding: "9px 14px", borderRadius: 10, marginBottom: 16,
        background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.18)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 13 }}>🎯</span>
        <div>
          <p style={{ fontSize: 8, letterSpacing: "0.25em", color: "rgba(167,139,250,0.45)", fontFamily: "'DM Mono',monospace", margin: "0 0 2px" }}>CURRENT GOAL</p>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: "#e2e8f0", margin: 0 }}>{goal}</p>
        </div>
      </div>

      {/* ── Stats: solved / revision / streak ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Solved",   value: totalSolved, icon: "◆", color: "#34d399", bg: "rgba(52,211,153,0.08)"   },
          { label: "Revision", value: revision,    icon: "◎", color: "#fbbf24", bg: "rgba(251,191,36,0.08)"  },
          { label: "Pending",  value: pending,     icon: "◈", color: "#a78bfa", bg: "rgba(167,139,250,0.08)" },
        ].map(({ label, value, icon, color, bg }, i) => (
          <div key={label} ref={(el) => (statsRef.current[i] = el)} style={{
            textAlign: "center", padding: "10px 6px", borderRadius: 12,
            background: bg, border: `1px solid ${color}22`,
          }}>
            <p style={{ fontSize: 18, fontWeight: 900, color, margin: "0 0 2px", letterSpacing: "-0.02em" }}>
              {icon} {value}
            </p>
            <p style={{ fontSize: 8.5, color: "rgba(148,163,184,0.4)", letterSpacing: "0.2em", fontFamily: "'DM Mono',monospace", margin: 0 }}>
              {label.toUpperCase()}
            </p>
          </div>
        ))}
      </div>

      {/* ── Streak row ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14,
      }}>
        {[
          { label: "Current Streak", value: `${currentStreak} 🔥 days`, color: "#f472b6", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.2)" },
          { label: "Longest Streak", value: `${longestStreak} 🏆 days`, color: "#fbbf24", bg: "rgba(251,191,36,0.07)",  border: "rgba(251,191,36,0.18)"  },
        ].map(({ label, value, color, bg, border }, i) => (
          <div key={label} ref={(el) => (statsRef.current[i + 3] = el)} style={{
            padding: "10px 14px", borderRadius: 12,
            background: bg, border: `1px solid ${border}`,
          }}>
            <p style={{ fontSize: 8, letterSpacing: "0.2em", color: "rgba(148,163,184,0.4)", fontFamily: "'DM Mono',monospace", margin: "0 0 4px" }}>{label.toUpperCase()}</p>
            <p style={{ fontSize: 13, fontWeight: 800, color, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 9, color: "rgba(148,163,184,0.45)", letterSpacing: "0.2em", fontFamily: "'DM Mono',monospace" }}>OVERALL PROGRESS</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa" }}>{user.progress}%</span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 999, overflow: "hidden" }}>
          <div id="summary-progress-bar" style={{
            height: "100%", borderRadius: 999, width: "0%",
            background: "linear-gradient(90deg,#7c3aed,#a78bfa,#22d3ee)",
            boxShadow: "0 0 12px rgba(167,139,250,0.55)",
          }} />
        </div>
      </div>
    </div>
  );
};

export default UserSummary;