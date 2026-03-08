import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import gsap from "gsap";

import PageHeader          from "../components/layout/PageHeader";
import SearchBar           from "../components/dsa/SearchBar";
import TopicSidebar        from "../components/dsa/TopicSidebar";
import ProblemList         from "../components/dsa/ProblemList";
import DifficultyBreakdown from "../components/dashboard/DifficultyBreakdown";
import { useIsMobile }     from "../hooks/useIsMobile";

/* ── Style tokens ── */
const TEXT   = "#e6edf3";
const BORDER = "rgba(117,130,145,0.9)";
const CARDBG = "rgba(9,11,12,0.82)";

/* ── Progress ring ── */
const Ring = ({ pct, color, size = 84, stroke = 6 }) => {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(pct, 1))}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
};

/* ── Section heading ── */
const SH = ({ children, accent = "#00e5a0" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
    <span style={{ fontSize: 12, color: accent, filter: `drop-shadow(0 0 6px ${accent})` }}>◎</span>
    <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0, fontFamily: "var(--font-display)" }}>
      {children}
    </p>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${accent}35,transparent)` }} />
  </div>
);

/* ── Card ── */
const Card = ({ children, style = {} }) => (
  <div style={{
    background: CARDBG, border: `1px solid ${BORDER}`,
    borderRadius: 14, backdropFilter: "blur(12px)",
    position: "relative", overflow: "hidden", ...style,
  }}>
    <div style={{
      position: "absolute", top: 0, left: "8%", right: "8%", height: 1,
      background: "linear-gradient(90deg,transparent,rgba(0,229,160,0.2),transparent)",
      pointerEvents: "none",
    }} />
    <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
  </div>
);

/* ══════════════════════════════════════════════════════ */
const DsaTracker = () => {
  const { isMobile, isTablet } = useIsMobile();

  /* ── UI state ── */
  const [problems,      setProblems]      = useState([]);
  const [activeTopic,   setActiveTopic]   = useState("All");
  const [loading,       setLoading]       = useState(false);
  const [hasMore,       setHasMore]       = useState(true);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);

  /* ── Topic state ── */
  const [topicList,     setTopicList]     = useState([]);
  const [topicTotals,   setTopicTotals]   = useState({});
  const [topicsLoading, setTopicsLoading] = useState(true);

  /* ── Summary state (solved counts, difficulty breakdown, total problems) ── */
  const [summary, setSummary] = useState(null);

  /* ── progressMap kept in a ref to avoid stale closure inside fetchQuestions ── */
  const progressMapRef = useRef({});

  /* ── Pagination / scroll refs ── */
  const pageRef      = useRef(1);
  const prevCountRef = useRef(0);
  const prevTopicRef = useRef("All");
  const loadingRef   = useRef(false);
  const hasMoreRef   = useRef(true);
  const containerRef = useRef(null);
  const headerRef    = useRef(null);

  /* ─────────────────────────────────────────────
     Auth helper
     ───────────────────────────────────────────── */
  const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /* ─────────────────────────────────────────────
     1. Dashboard summary — totalSolved, easy/medium/hard, totalProblems
     ───────────────────────────────────────────── */
  const fetchSummary = useCallback(() => {
    axios
      .get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/dashboard/summary", { headers: authHeader() })
      .then(r => setSummary(r.data))
      .catch(console.error);
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  /* ─────────────────────────────────────────────
     2. Topics + per-topic totals (once)
     ───────────────────────────────────────────── */
  useEffect(() => {
    axios
      .get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/meta/topics")
      .then(r => {
        setTopicList(Object.keys(r.data));
        setTopicTotals(r.data);
      })
      .catch(console.error)
      .finally(() => setTopicsLoading(false));
  }, []);

  /* ─────────────────────────────────────────────
     3. Core fetch — paginated, topic-filtered.
        Uses progressMapRef (not state) so the
        async function never reads a stale closure.
     ───────────────────────────────────────────── */
  const fetchQuestions = useCallback(async (pageNum, topic) => {
    if (loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const params = new URLSearchParams({ page: pageNum, limit: 50 });
      if (topic !== "All") params.set("topic", topic);

      // Fetch questions + progress map in parallel (progress only on page 1)
      const [qRes, progRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/questions?${params}`),
        pageNum === 1
          ? axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/progress", { headers: authHeader() }).catch(() => null)
          : Promise.resolve(null),
      ]);

      if (pageNum === 1 && progRes?.data) {
        progressMapRef.current = progRes.data;
      }

      const { data = [], total = 0 } = qRes.data;

      const withStatus = data.map(q => ({
        ...q,
        status: progressMapRef.current[q.id] || "Pending",
      }));

      setProblems(prev => pageNum === 1 ? withStatus : [...prev, ...withStatus]);

      // Backfill totalProblems from questions API if summary hasn't set it yet
      if (pageNum === 1 && total) {
        setSummary(prev => prev ? { ...prev, totalProblems: prev.totalProblems ?? total } : prev);
      }

      if (data.length < 50) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }

    loadingRef.current = false;
    setLoading(false);
  }, []); // intentionally no deps — progressMapRef never causes stale reads

  /* ─────────────────────────────────────────────
     4. Reset + refetch on topic change
     ───────────────────────────────────────────── */
  useEffect(() => {
    setProblems([]);
    pageRef.current      = 1;
    prevCountRef.current = 0;
    hasMoreRef.current   = true;
    loadingRef.current   = false;
    setHasMore(true);
    window.scrollTo({ top: 0, behavior: "instant" });
    fetchQuestions(1, activeTopic);
  }, [activeTopic, fetchQuestions]);

  /* ─────────────────────────────────────────────
     5. Infinite scroll
     ───────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loadingRef.current &&
        hasMoreRef.current
      ) {
        pageRef.current += 1;
        fetchQuestions(pageRef.current, activeTopic);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [activeTopic, fetchQuestions]);

  /* ─────────────────────────────────────────────
     6. Entrance animation (once)
     ───────────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 })
      .fromTo(headerRef.current,
        { opacity: 0, y: -20, filter: "blur(8px)" },
        { opacity: 1, y: 0,   filter: "blur(0px)", duration: 0.75 },
        "-=0.3")
      .fromTo(".dsa-stat-card",
        { opacity: 0, y: 22, filter: "blur(5px)" },
        { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.5, stagger: 0.07 },
        "-=0.5");
  }, []);

  /* ─────────────────────────────────────────────
     7. Row animation — only animates truly new rows,
        never flashes already-visible ones
     ───────────────────────────────────────────── */
  useEffect(() => {
    if (problems.length === 0) { prevCountRef.current = 0; return; }

    const allRows       = Array.from(document.querySelectorAll(".problem-row"));
    const isTopicSwitch = prevTopicRef.current !== activeTopic;
    prevTopicRef.current = activeTopic;

    if (isTopicSwitch) {
      gsap.killTweensOf(allRows);
      gsap.set(allRows, { opacity: 0, y: 12, filter: "blur(4px)" });
      gsap.to(allRows,  { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.38, stagger: 0.035, ease: "expo.out" });
      prevCountRef.current = allRows.length;
    } else {
      const prev = prevCountRef.current;
      prevCountRef.current = allRows.length;
      if (allRows.length > prev) {
        const newRows = allRows.slice(prev);
        gsap.set(newRows, { opacity: 0, y: 12, filter: "blur(4px)" });
        gsap.to(newRows,  { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.38, stagger: 0.035, ease: "expo.out" });
      }
    }
  }, [problems, activeTopic]);

  /* ─────────────────────────────────────────────
     8. Status update — optimistic UI + re-sync summary
     ───────────────────────────────────────────── */
  const updateStatus = async (problemId, newStatus) => {
    try {
      await axios.post(
        (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/progress/update",
        { problemId, status: newStatus },
        { headers: authHeader() }
      );
      progressMapRef.current = { ...progressMapRef.current, [problemId]: newStatus };
      setProblems(prev => prev.map(p => p.id === problemId ? { ...p, status: newStatus } : p));
      fetchSummary(); // refresh solved count + difficulty rings
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  /* ─────────────────────────────────────────────
     Derived values
     ───────────────────────────────────────────── */
  const totalSolved   = summary?.totalSolved   ?? 0;
  const totalProblems = summary?.totalProblems ?? 0;
  const easy          = summary?.easy   ?? { solved: 0, total: 0 };
  const medium        = summary?.medium ?? { solved: 0, total: 0 };
  const hard          = summary?.hard   ?? { solved: 0, total: 0 };

  const topicStats = useMemo(() => {
    const map = {};
    problems.forEach(p => {
      const t = p.topic || "Other";
      if (!map[t]) map[t] = { solved: 0, revision: 0, loaded: 0 };
      map[t].loaded++;
      if (p.status === "Solved")   map[t].solved++;
      if (p.status === "Revision") map[t].revision++;
    });
    return map;
  }, [problems]);

  const allTopics = useMemo(() => {
    if (activeTopic === "All") return ["All", ...topicList];
    return ["All", activeTopic, ...topicList.filter(t => t !== activeTopic)];
  }, [topicList, activeTopic]);

  /* ─────────────────────────────────────────────
     Render
     ───────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: "var(--font-display)",
        minHeight:  "100vh",
        background: "transparent",
        color:      "#e2e8f0",
        padding:    "0 0 80px",
        position:   "relative",
      }}
    >
      {/* ── Header ── */}
      <div ref={headerRef}>
        <PageHeader
          label="▸ DSA TRACKER"
          title="DSA Tracker"
          gradient="linear-gradient(120deg,#e6edf3 20%,#00e5a0 100%)"
          style={{ height: 72 }}
          rightSlot={
            <>
              <SearchBar />
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 16px", borderRadius: 8,
                background: "rgba(0,229,160,0.12)",
                border: "1px solid rgba(0,229,160,0.35)",
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#00e5a0", boxShadow: "0 0 8px #00e5a0",
                  animation: "livepulse 2s ease-in-out infinite",
                }} />
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  fontFamily: "'DM Mono',monospace",
                  color: "#00e5a0", letterSpacing: "0.12em",
                }}>
                  {totalSolved} / {totalProblems || "…"} SOLVED
                </span>
              </div>
            </>
          }
        />
      </div>

      <div style={{
        maxWidth: "90%",
        margin:   "0 auto",
        padding:  isMobile ? "16px 14px" : isTablet ? "20px 24px" : "20px 32px",
        position: "relative",
        zIndex:   10,
      }}>

        {/* ── Difficulty Breakdown ── */}
        <div className="dsa-stat-card" style={{ marginBottom: 20 }}>
          <DifficultyBreakdown 
            easy={easy} 
            medium={medium} 
            hard={hard}
            totalSolved={totalSolved} 
            totalProblems={totalProblems}
          />
        </div>

        {/* ── Mobile topic toggle ── */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 12, padding: "8px 16px", borderRadius: 6,
              background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)",
              color: "#a78bfa", fontSize: 9, fontFamily: "'DM Mono',monospace",
              letterSpacing: "0.2em", cursor: "pointer", fontWeight: 700,
            }}
          >
            {sidebarOpen ? "▲ HIDE TOPICS" : "▼ FILTER BY TOPIC"}
          </button>
        )}

        {/* ── Sidebar + Problem list ── */}
        <div style={{
          display:             "grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "180px 1fr" : "210px 1fr",
          gap:                 isMobile ? 12 : 18,
          alignItems:          "start",
        }}>
          {(!isMobile || sidebarOpen) && (
            <TopicSidebar
              topicsLoading={topicsLoading}
              allTopics={allTopics}
              activeTopic={activeTopic}
              setActiveTopic={t => { setActiveTopic(t); if (isMobile) setSidebarOpen(false); }}
              topicStats={topicStats}
              topicTotals={topicTotals}
            />
          )}

          <ProblemList
            displayed={problems}
            loading={loading}
            hasMore={hasMore}
            activeTopic={activeTopic}
            updateStatus={updateStatus}
          />
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: "center", padding: "20px 0 8px", borderTop: "1px solid rgba(124,58,237,0.12)" }}>
        <p style={{
          fontSize: 8, letterSpacing: "0.35em",
          color: "rgba(124,58,237,0.3)", fontFamily: "'DM Mono',monospace", margin: 0,
        }}>
          CYBERLINK NEURAL TRACKER v2.2.4 // SESSION ACTIVE
        </p>
      </div>

      <style>{`
        @keyframes livepulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.78)} }
      `}</style>
    </div>
  );
};

export default DsaTracker;