/**
 * DsaProgress.jsx — Per-topic solved charts
 *
 * Charts displayed per topic:
 *  1. Horizontal bar chart — solved / total with animated fill
 *  2. Difficulty split pill chart — Easy | Med | Hard counts
 *  3. Radial arc progress ring — % complete (SVG)
 */
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import gsap from "gsap";

/* ── SVG radial progress ring ── */
const RadialRing = ({ pct, color, size = 64, stroke = 4 }) => {
  const r   = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      {/* Arc */}
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 6px ${color}80)`, transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
    </svg>
  );
};

const COLORS = {
  high:   { bar: "#34d399", glow: "rgba(52,211,153,0.3)",  ring: "#34d399" },
  mid:    { bar: "#a78bfa", glow: "rgba(167,139,250,0.3)", ring: "#a78bfa" },
  low:    { bar: "#fbbf24", glow: "rgba(251,191,36,0.3)",  ring: "#fbbf24" },
  easy:   "#34d399",
  medium: "#fbbf24",
  hard:   "#f87171",
};

const getColorSet = (pct) =>
  pct >= 70 ? COLORS.high : pct >= 40 ? COLORS.mid : COLORS.low;

const DsaProgress = () => {
  const [topics,    setTopics]    = useState([]);
  const [animPct,   setAnimPct]   = useState({}); // topic → animated pct for rings
  const cardsRef = useRef([]);

  useEffect(() => {
    const fetchDsa = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard/dsa", {
          withCredentials: true,
        });
        const data = Array.isArray(res.data) ? res.data : (res.data?.topics || []);
        setTopics(data);
        const zeros = {};
        data.forEach(t => { zeros[t.topic] = 0; });
        setAnimPct(zeros);
        setTimeout(() => {
          const real = {};
          data.forEach(t => { real[t.topic] = t.progress; });
          setAnimPct(real);
        }, 200);
      } catch (e) {
        console.error("DSA fetch failed:", e);
        setTopics([]);
      }
    };
    fetchDsa();
  }, []);

  useEffect(() => {
    if (topics.length === 0 || cardsRef.current.filter(Boolean).length === 0) return;
    gsap.fromTo(cardsRef.current.filter(Boolean),
      { opacity: 0, y: 28, filter: "blur(8px)" },
      { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.5, stagger: 0.08, ease: "expo.out", delay: 0.1 }
    );
    // Animate horizontal bars
    topics.forEach((t, idx) => {
      const bar = document.getElementById(`dsa-bar-${idx}`);
      if (bar) gsap.fromTo(bar,
        { width: "0%" },
        { width: `${t.progress}%`, duration: 1.3, delay: 0.2 + idx * 0.08, ease: "power3.out" }
      );
    });
  }, [topics]);

  if (topics.length === 0) return (
    <div style={{ textAlign:"center", padding:"40px 20px",
      background:"rgba(255,255,255,0.03)", borderRadius:16,
      border:"1px solid rgba(255,255,255,0.07)" }}>
      <p style={{ fontSize:11, color:"rgba(148,163,184,0.35)", letterSpacing:"0.3em",
        fontFamily:"var(--font-mono)" }}>NO DSA DATA</p>
    </div>
  );

  return (
    <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:14 }}>
      {topics.map((t, idx) => {
        const pct = t.progress ?? 0;
        const col = getColorSet(pct);
        const animP = animPct[t.topic] ?? 0;

        return (
          <div
            key={t.topic}
            ref={el => (cardsRef.current[idx] = el)}
            style={{
              background:     "linear-gradient(135deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)",
              border:         "1px solid rgba(255,255,255,0.09)",
              borderRadius:   16,
              padding:        "16px 18px",
              backdropFilter: "blur(16px)",
              boxShadow:      "0 4px 24px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.06)",
              position:       "relative", overflow:"hidden",
            }}
            onMouseEnter={e => gsap.to(e.currentTarget, { y:-5, scale:1.01, duration:0.3, ease:"power2.out" })}
            onMouseLeave={e => gsap.to(e.currentTarget, { y:0,  scale:1,    duration:0.3, ease:"power2.out" })}
          >
            {/* Ambient glow blob */}
            <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80,
              borderRadius:"50%", pointerEvents:"none",
              background:`radial-gradient(circle,${col.glow} 0%,transparent 70%)`,
              filter:"blur(20px)" }} />

            {/* ── Row 1: topic name + ring + pct ── */}
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
              {/* Radial ring */}
              <div style={{ position:"relative", flexShrink:0 }}>
                <RadialRing pct={animP} color={col.ring} size={60} stroke={4} />
                <div style={{ position:"absolute", inset:0, display:"flex",
                  alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:10, fontWeight:800, color:col.ring,
                    fontFamily:"var(--font-mono)" }}>{pct}%</span>
                </div>
              </div>

              {/* Topic title + counts */}
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:700, color:"#e2e8f0",
                  fontFamily:"var(--font-display)", letterSpacing:"0.03em",
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {t.topic}
                </p>
                <p style={{ margin:0, fontSize:10, color:"rgba(148,163,184,0.5)",
                  fontFamily:"var(--font-mono)" }}>
                  <span style={{ color:"#e2e8f0", fontWeight:700 }}>{t.solved}</span>
                  {" / "}{t.total} solved
                </p>
              </div>
            </div>

            {/* ── Row 2: Horizontal progress bar ── */}
            <div style={{ width:"100%", height:4, borderRadius:999,
              background:"rgba(255,255,255,0.07)", overflow:"hidden", marginBottom:10 }}>
              <div id={`dsa-bar-${idx}`} style={{
                height:"100%", borderRadius:999, width:"0%",
                background:`linear-gradient(90deg,${col.bar}80,${col.bar})`,
                boxShadow:`0 0 10px ${col.glow}`,
              }} />
            </div>

            {/* ── Row 3: Difficulty split ── */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
              {[
                { label:"Easy", value:t.easy,   color:COLORS.easy   },
                { label:"Med",  value:t.medium,  color:COLORS.medium },
                { label:"Hard", value:t.hard,    color:COLORS.hard   },
              ].map(({ label, value, color }) => {
                const total  = (t.easy || 0) + (t.medium || 0) + (t.hard || 0);
                const barPct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={label} style={{
                    padding:"8px 4px", textAlign:"center",
                    background:`${color}10`,
                    border:`1px solid ${color}25`, borderRadius:10,
                    position:"relative", overflow:"hidden",
                  }}>
                    {/* Mini fill bar at bottom */}
                    <div style={{
                      position:"absolute", bottom:0, left:0,
                      height:2, borderRadius:999,
                      width:`${barPct}%`, background:color,
                      boxShadow:`0 0 6px ${color}80`,
                      transition:"width 1.2s cubic-bezier(0.34,1.56,0.64,1)",
                    }} />
                    <p style={{ margin:"0 0 2px", fontSize:15, fontWeight:800, color }}>{value ?? 0}</p>
                    <p style={{ margin:0, fontSize:8, color:"rgba(148,163,184,0.45)",
                      letterSpacing:"0.12em", fontFamily:"var(--font-mono)" }}>
                      {label.toUpperCase()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DsaProgress;