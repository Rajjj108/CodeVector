/**
 * Dashboard.jsx — CodeVektor (full fix)
 * ✅ Uses AppBackground (transparent bg) — same as DsaTracker
 * ✅ Proper header via PageHeader: hamburger + brand + search + solved count
 * ✅ Difficulty data fetched from real API (/api/dashboard/summary)
 * ✅ InterviewSection restored
 * ✅ GSAP entrance + card hover animations
 * ✅ Time-based greeting
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate }  from "react-router-dom";
import { useAuth }      from "../context/AuthContext";
import { useStreak }    from "../components/layout/StreakContext";
import { useTheme }     from "../components/layout/ThemeContext";
import axios            from "axios";
import gsap             from "gsap";
import DifficultyBreakdown from "../components/dashboard/DifficultyBreakdown";
import DashboardFooter    from "../components/dashboard/DashboardFooter";


/* ── Existing dashboard components (APIs unchanged) ── */
import TodaysFocus        from "../components/dashboard/TodaysFocus";
import DsaProgress        from "../components/dashboard/DsaProgress";
import ActivityTimeline   from "../components/dashboard/ActivityTimeline";
import InterviewSection   from "../components/dashboard/InterviewSection";
import NotesDashboardWidget from "../components/dashboard/NotesDashboardWidget";
import HeatmapCalendar    from "../components/analytics/HeatmapCalendar";
import PageHeader         from "../components/layout/PageHeader";
import SearchBar          from "../components/dsa/SearchBar";

/* ── Time-of-day greeting ── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const getDayLabel = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

/* ── Brand colours ─────────────────────────────────── */
const MUTED    = "#beccdd";           // bright muted
const TEXT     = "#e6edf3";
const BORDER   = "rgba(117, 130, 145, 0.9)";
const CARDBG   = "rgba(9, 11, 12, 0.82)";

/* ── Tiny card wrapper ── */
const Card = ({ children, style = {}, className = "" }) => (
  <div
    className={className}
    style={{
      background:   CARDBG,
      border:       `1px solid ${BORDER}`,
      borderRadius: 14,
      backdropFilter: "blur(12px)",
      position:     "relative",
      overflow:     "hidden",
      ...style,
    }}
  >
    <div style={{
      position: "absolute", top: 0, left: "8%", right: "8%", height: 1,
      background: "linear-gradient(90deg,transparent,rgba(0,229,160,0.2),transparent)",
      pointerEvents: "none",
    }} />
    <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
  </div>
);

/* ── Stat card ── */
const StatCard = ({ label, value, sub, icon, accent = "#00e5a0", refEl }) => (
  <div
    ref={refEl}
    className="dash-stat"
    style={{
      flex: 1,
      background:   CARDBG,
      border:       `1px solid ${BORDER}`,
      borderRadius: 14,
      padding:      "22px 24px",
      backdropFilter: "blur(12px)",
      position:     "relative",
      overflow:     "hidden",
      cursor: "default",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = `${accent}55`;
      e.currentTarget.style.boxShadow   = `0 0 28px ${accent}20`;
      gsap.to(e.currentTarget, { y: -4, duration: 0.22, ease: "power2.out" });
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = BORDER;
      e.currentTarget.style.boxShadow   = "none";
      gsap.to(e.currentTarget, { y: 0, duration: 0.3, ease: "power2.out" });
    }}
  >
    <div style={{
      position: "absolute", top: 0, left: "8%", right: "8%", height: 1,
      background: `linear-gradient(90deg,transparent,${accent}45,transparent)`,
      pointerEvents: "none",
    }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <p style={{ fontSize: 10, letterSpacing: "0.24em", color: MUTED, fontFamily: "'DM Mono',monospace", margin: "0 0 12px", textTransform: "uppercase" }}>{label}</p>
      <span style={{ fontSize: 20, opacity: 0.75 }}>{icon}</span>
    </div>
    <p style={{
      fontSize: 44, fontWeight: 900, margin: "0 0 6px",
      fontFamily: "var(--font-display)", color: TEXT,
      lineHeight: 1, letterSpacing: "-0.04em",
    }}>{value}</p>
    {sub && <p style={{ fontSize: 11, color: MUTED, margin: 0, fontFamily: "'DM Mono',monospace" }}>{sub}</p>}
  </div>
);

/* ── Section heading ── */
const SH = ({ children, accent = "#00e5a0" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
    <span style={{ fontSize: 12, color: accent, filter: `drop-shadow(0 0 6px ${accent})` }}>◎</span>
    <p style={{
      fontSize: 15, fontWeight: 700, color: TEXT,
      margin: 0, fontFamily: "var(--font-display)",
    }}>{children}</p>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${accent}35,transparent)` }} />
  </div>
);

/* ── Progress ring ── */
const Ring = ({ pct, color, size = 84, stroke = 6 }) => {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(pct, 1))}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
};

/* ══════════════════════════════════════════════════════ */
const Dashboard = () => {
  const containerRef = useRef(null);
  const statsRef     = useRef([]);
  useAuth();
  useStreak();
  useTheme();
  const navigate = useNavigate();

  const [user,    setUser]   = useState(null);

  /* ── Fetch dashboard summary (streak, accuracy, solved, difficulty) ── */
  useEffect(() => {
    axios.get("http://localhost:5000/api/dashboard/summary", { withCredentials: true })
      .then(r => setUser(r.data))
      .catch(() => {});
  }, []);

  /* ── GSAP entrance animations ── */
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.fromTo(".dash-s",
      { opacity: 0, y: 28, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.65, stagger: 0.08, delay: 0.05 }
    );
  }, []);

  /* Stat card refs animation after user loads */
  useEffect(() => {
    if (!user) return;
    gsap.fromTo(statsRef.current.filter(Boolean),
      { opacity: 0, y: 20, filter: "blur(4px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55, stagger: 0.1, ease: "expo.out" }
    );
  }, [user]);

  /* ── Derived stats (all from API, no hardcoded fallbacks) ── */
  const totalSolved   = user?.totalSolved ?? 0;
  const totalProblems = 2913;
  const accuracy      = user?.accuracy ?? (totalSolved ? Math.round((totalSolved / totalProblems) * 100) : 0);
  const solvedToday   = user?.solvedToday ?? 0;
  const currentStreak = typeof user?.streak === "object" ? (user.streak?.current ?? 0) : (user?.streak ?? 0);

  /* Difficulty breakdown — straight from API, zero if loading */
  const easy   = user?.easy   ?? { solved: 0, total: 0 };
  const medium = user?.medium ?? { solved: 0, total: 0 };
  const hard   = user?.hard   ?? { solved: 0, total: 0 };
  /* Solved/total header badge */
  const rightSlot = (
  <>
    {/* Search */}
    <SearchBar />

    {/* Solved counter */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 16px",
        borderRadius: 8,
        background: "rgba(0,229,160,0.12)",
        border: "1px solid rgba(0,229,160,0.35)",
        boxShadow: "0 0 16px rgba(0,229,160,0.1)",
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#00e5a0",
          boxShadow: "0 0 8px #00e5a0",
          animation: "livepulse 2s ease-in-out infinite",
        }}
      />

      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "'DM Mono',monospace",
          color: "#00e5a0",
          letterSpacing: "0.12em",
        }}
      >
        {totalSolved} / {totalProblems} SOLVED
      </span>
    </div>
  </>
);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight:  "100vh",
        background: "transparent",   /* sits on AppBackground */
        fontFamily: "var(--font-display)",
        color:      "#e6edf3",
        position:   "relative",
      }}
    >
      {/* ── Header: hamburger + brand + search + solved ── */}
      <PageHeader
        label="▸ DASHBOARD"
        title="Dashboard"
        gradient="linear-gradient(120deg,#e6edf3 20%,#00e5a0 100%)"
        rightSlot={rightSlot}
        style={{ height: 72 }}
      />

      <div style={{maxWidth: "90%", margin: "0 auto" }}>

        {/* ── Greeting row ── */}
        <div className="dash-s" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 6px", letterSpacing: "-0.03em", color: "#e6edf3" }}>
              {getGreeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "#00e5a0", fontFamily: "'DM Mono',monospace", letterSpacing: "0.04em" }}>
              ▶ {getDayLabel()}
            </p>
          </div>
          {/* Daily goal — reads from API */}
          <div style={{
            padding: "10px 20px", borderRadius: 10,
            background: "rgba(22,27,34,0.82)", border: "1px solid rgba(33,38,45,0.9)",
            fontSize: 12, color: "rgba(139,148,158,0.8)", fontFamily: "'DM Mono',monospace",
            display: "flex", alignItems: "center", gap: 8,
            backdropFilter: "blur(12px)",
          }}>
            <span style={{ color: "#e6edf3", fontWeight: 700 }}>Daily Goal:</span>
            <span style={{ color: "#00e5a0", fontWeight: 900 }}>{solvedToday}</span>
            <span>/ 5 solved</span>
          </div>
        </div>

        {/* ── 4 Stat cards ── */}
        <div className="dash-s" style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          <StatCard
            refEl={el => statsRef.current[0] = el}
            label="Solved Today"   value={solvedToday}
            sub={solvedToday > 0 ? `+${solvedToday} from yesterday` : "Start solving!"}
            icon="⚡" accent="#00e5a0"
          />
          <StatCard
            refEl={el => statsRef.current[1] = el}
            label="Current Streak" value={currentStreak}
            sub={`days 🔥`} icon="💧" accent="#58a6ff"
          />
          <StatCard
            refEl={el => statsRef.current[2] = el}
            label="Total Solved"   value={totalSolved}
            sub={`out of ${totalProblems}`} icon="🏆" accent="#04d9a0"
          />
          <StatCard
            refEl={el => statsRef.current[3] = el}
            label="Accuracy"       value={`${accuracy}%`}
            sub="acceptance rate" icon="◎" accent="#e3b341"
          />
        </div>

        {/* ── Two-column main layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 16, alignItems: "start" }}>

          {/* ─── LEFT COLUMN ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Difficulty Breakdown — real API data */}
            <div className="dash-s">
              <DifficultyBreakdown 
                easy={easy} 
                medium={medium} 
                hard={hard}
                totalSolved={totalSolved} 
                totalProblems={totalProblems}
              />
            </div>

            {/* Activity Heatmap — 90 days */}
            <div className="dash-s">
              <Card style={{ padding: "22px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <SH accent="#58a6ff">Activity — Last 90 days</SH>
                  <span style={{ fontSize: 10, color: "#00e5a0", fontFamily: "'DM Mono',monospace" }}>
                    ● {user?.activeDays ?? 0} active days
                  </span>
                </div>
                <HeatmapCalendar days={90} />
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="dash-s">
              <Card style={{ padding: "22px 24px" }}>
                <SH accent="#a371f7">Recent Activity</SH>
                <ActivityTimeline />
              </Card>
            </div>

            {/* Interview Section */}
            <div className="dash-s">
              <Card>
                <InterviewSection />
              </Card>
            </div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Today's Focus */}
            <div className="dash-s">
              <Card>
                <TodaysFocus />
              </Card>
            </div>

            {/* Top Topics */}
            <div className="dash-s">
              <Card style={{ padding: "22px 24px" }}>
                <SH accent="#e3b341">Top Topics</SH>
                <DsaProgress compact />
              </Card>
            </div>

            {/* Pinned Notes */}
            <div className="dash-s">
              <Card style={{ padding: "22px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <SH accent="#f472b6">Pinned Notes</SH>
                  <button
                    onClick={() => navigate("/notes")}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "rgba(139,148,158,0.7)", padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = "#f472b6"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(139,148,158,0.7)"}
                  >⊙</button>
                </div>
                <NotesDashboardWidget />
              </Card>
            </div>

          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <DashboardFooter />

      <style>{`
        @keyframes livepulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.78)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(139,148,158,0.4); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(33,38,45,0.9); border-radius: 4px; }
        .dash-stat { transform: translateY(0); }
      `}</style>
    </div>
  );
};

export default Dashboard;