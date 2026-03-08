import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

const DIFF_COLOR = {
  easy:   { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)"  },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)"  },
  hard:   { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
};

/* SVG progress ring */
const Ring = ({ solved, total = 4, size = 52, stroke = 4 }) => {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(solved / Math.max(total, 1), 1);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="rgba(34,211,238,0.12)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={solved >= total ? "#34d399" : "#22d3ee"}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.7s ease, stroke 0.4s" }}
      />
    </svg>
  );
};

const TodaysFocus = () => {
  const [problems,  setProblems]  = useState([]);
  const [solvedIds, setSolvedIds] = useState({});   // { "LC_1": "Solved" }
  const [topic,     setTopic]     = useState("");
  const [loading,   setLoading]   = useState(true);
  const containerRef = useRef(null);
  const pulseRef     = useRef(null);
  const navigate     = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token   = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch focus problems + solved IDs in parallel from MongoDB
      const [focusRes, progressRes] = await Promise.all([
        axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/dashboard/focus", { headers }),
        token
          ? axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/progress/solved-ids", { headers })
          : Promise.resolve({ data: {} }),
      ]);

      setProblems(focusRes.data.problems || []);
      setTopic(focusRes.data.lastTopic || focusRes.data.topic || "");
      setSolvedIds(progressRes.data || {});
    } catch (err) {
      console.error("TodaysFocus load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (loading || !containerRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.fromTo(containerRef.current,
        { opacity: 0, y: 24, filter: "blur(8px)" },
        { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.85 })
      .fromTo(".tf-prob",
        { opacity: 0, x: -14, filter: "blur(4px)" },
        { opacity: 1, x: 0,   filter: "blur(0px)", duration: 0.5, stagger: 0.09 },
        "-=0.55");
    if (pulseRef.current) {
      gsap.to(pulseRef.current, { scale: 1.9, opacity: 0, duration: 1.6, repeat: -1, ease: "power2.out" });
    }
  }, [loading]);

  const onRowEnter = (e) => gsap.to(e.currentTarget, { x: 5, borderColor: "rgba(34,211,238,0.28)", duration: 0.22 });
  const onRowLeave = (e) => gsap.to(e.currentTarget, { x: 0, borderColor: "rgba(255,255,255,0.07)", duration: 0.28 });
  const onBtnEnter = (e) => gsap.to(e.currentTarget, { scale: 1.02, y: -2, boxShadow: "0 16px 40px rgba(34,211,238,0.3)", duration: 0.28 });
  const onBtnLeave = (e) => gsap.to(e.currentTarget, { scale: 1,    y: 0,  boxShadow: "0 4px 16px rgba(34,211,238,0.12)", duration: 0.35 });

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 0" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{
          width:24, height:24, border:"2px solid rgba(34,211,238,0.18)",
          borderTopColor:"#22d3ee", borderRadius:"50%",
          animation:"spin 1s linear infinite", margin:"0 auto 10px",
        }} />
        <p style={{ fontSize:9, color:"rgba(34,211,238,0.4)", letterSpacing:"0.35em", fontFamily:"'DM Mono',monospace" }}>
          LOADING MISSION
        </p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  // Check by _id or frontendId (LC_xx format) against the solved map
  const isSolved = (p) => {
    const id = p._id || p.frontendId || p.id;
    const st = solvedIds[id];
    return st === "Solved" || st === "solved";
  };

  const solvedCount = problems.filter(isSolved).length;
  const total       = Math.min(problems.length, 4);

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily:     "var(--font-display)",
        background:     "linear-gradient(135deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 100%)",
        border:         "1px solid rgba(255,255,255,0.08)",
        borderRadius:   20,
        padding:        "24px",
        backdropFilter: "blur(16px)",
        boxShadow:      "0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)",
        position:       "relative",
        overflow:       "hidden",
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position:"absolute", top:-40, right:-40, width:200, height:200,
        borderRadius:"50%",
        background:"radial-gradient(circle,rgba(34,211,238,0.07) 0%,transparent 70%)",
        filter:"blur(20px)", pointerEvents:"none",
      }} />

      <p style={{ fontSize:9, letterSpacing:"0.4em", color:"rgba(201, 242, 248, 0.5)", fontFamily:"'DM Mono',monospace", margin:"0 0 4px" }}>
        ▸ DAILY_MISSION
      </p>
      <h2 style={{
        fontSize:17, fontWeight:900, letterSpacing:"-0.03em", margin:"0 0 18px",
        background:"linear-gradient(120deg,#fff 20%,#22d3ee 80%)",
        WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
      }}>Today's Focus</h2>

      {/* Topic card with ring */}
      {topic && (
        <div style={{
          marginBottom:18, padding:"14px 16px", borderRadius:14,
          background:"rgba(34,211,238,0.05)", border:"1px solid rgba(34,211,238,0.2)",
          display:"flex", alignItems:"center", gap:14,
        }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <Ring solved={solvedCount} total={total} />
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{
                fontFamily:"'DM Mono',monospace", fontSize:11, fontWeight:700,
                color: solvedCount >= total ? "#34d399" : "#22d3ee",
              }}>{solvedCount}/{total}</span>
            </div>
          </div>

          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
              <div style={{ position:"relative" }}>
                <div ref={pulseRef} style={{ position:"absolute", inset:-3, borderRadius:"50%", background:"#22d3ee", opacity:0.35 }} />
                <div style={{ width:7, height:7, borderRadius:"50%", background:"#22d3ee", boxShadow:"0 0 10px rgba(34,211,238,0.9)", position:"relative" }} />
              </div>
              <p style={{ fontSize:8.5, letterSpacing:"0.2em", color:"rgba(34,211,238,0.5)", fontFamily:"'DM Mono',monospace", margin:0 }}>
                TOPIC · ACTIVE
              </p>
            </div>
            <p style={{ fontSize:15, fontWeight:700, color:"#e2e8f0", margin:0 }}>{topic}</p>
          </div>

          {solvedCount >= total && total > 0 && (
            <div style={{ padding:"4px 10px", borderRadius:8, flexShrink:0, background:"rgba(52,211,153,0.12)", border:"1px solid rgba(52,211,153,0.3)" }}>
              <span style={{ fontSize:9, color:"#34d399", fontFamily:"'DM Mono',monospace", fontWeight:700 }}>✓ DONE</span>
            </div>
          )}
        </div>
      )}

      {/* Problem list */}
      <p style={{ fontSize:9, letterSpacing:"0.3em", color:"rgba(244, 240, 255, 0.6)", fontFamily:"'DM Mono',monospace", margin:"0 0 8px" }}>
        RECOMMENDED PROBLEMS
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:18 }}>
        {problems.length === 0 ? (
          <p style={{ fontSize:11, color:"rgba(212, 220, 231, 0.4)", fontFamily:"'DM Mono',monospace", padding:"8px 0" }}>
            All problems in this topic are solved! 🎉
          </p>
        ) : problems.map((p, i) => {
          const diff   = (p.difficulty || "").toLowerCase();
          const dc     = DIFF_COLOR[diff] || { color:"#94a3b8", bg:"rgba(148,163,184,0.08)", border:"rgba(148,163,184,0.2)" };
          const navId  = p._id || p.frontendId || p.id;
          const solved = isSolved(p);

          return (
            <div
              key={navId || i}
              className="tf-prob"
              onMouseEnter={onRowEnter}
              onMouseLeave={onRowLeave}
              onClick={() => navigate(`/editor/${navId}`)}
              style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"10px 12px", borderRadius:11, cursor:"pointer",
                background: solved ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.03)",
                border:`1px solid ${solved ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.07)"}`,
                transition:"border-color 0.2s, background 0.2s",
                opacity: solved ? 0.65 : 1,
              }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{
                  fontSize:9, width:18, textAlign:"center",
                  color: solved ? "#34d399" : "rgba(148,163,184,0.35)",
                  fontFamily:"'DM Mono',monospace", fontWeight:700, flexShrink:0,
                }}>
                  {solved ? "✓" : String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontSize:12, fontWeight:600, color: solved ? "rgba(52,211,153,0.7)" : "#cbd5e1" }}>
                  {p.title}
                </span>
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                <span style={{
                  fontSize:8.5, fontWeight:700, letterSpacing:"0.1em",
                  color:dc.color, background:dc.bg, border:`1px solid ${dc.border}`,
                  borderRadius:5, padding:"2px 7px", fontFamily:"'DM Mono',monospace",
                }}>
                  {(p.difficulty || "?").toUpperCase()}
                </span>
                {!solved && <span style={{ fontSize:10, color:"rgba(34,211,238,0.3)" }}>›</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {problems.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:8, color:"rgba(255,255,255,0.35)", fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em" }}>
              TODAY'S PROGRESS
            </span>
            <span style={{ fontSize:8, color:"rgba(208,249,255,0.5)", fontFamily:"'DM Mono',monospace" }}>
              {solvedCount}/{total}
            </span>
          </div>
          <div style={{ height:3, borderRadius:2, background:"rgba(255,255,255,0.05)", overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:2,
              background: solvedCount >= total
                ? "linear-gradient(90deg,#34d399,#4ade80)"
                : "linear-gradient(90deg,#22d3ee,#06b6d4)",
              width:`${(solvedCount / Math.max(total, 1)) * 100}%`,
              transition:"width 0.7s ease",
            }} />
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => navigate("/dsa-tracker")}
        onMouseEnter={onBtnEnter}
        onMouseLeave={onBtnLeave}
        style={{
          width:"100%", padding:"12px 0", borderRadius:12, border:"none",
          background:"linear-gradient(90deg,#22d3ee,#04d9a0)",
          color:"#05080f", fontWeight:800, fontSize:11,
          letterSpacing:"0.2em", textTransform:"uppercase", cursor:"pointer",
          boxShadow:"0 4px 16px #04d9a0",
          fontFamily:"'DM Mono',monospace",
        }}
      >
        Browse All Problems →
      </button>
    </div>
  );
};

export default TodaysFocus;