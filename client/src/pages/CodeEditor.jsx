import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import gsap from "gsap";

import EditorPanel from "../components/editor/EditorPanel";
import OutputPanel from "../components/editor/OutputPanel";
import ProblemDescription from "../components/editor/ProblemDescription";
import LanguageSwitcher from "../components/editor/LanguageSwitcher";
import AppBackground from "../components/AppBackground";
import Whiteboard from "../components/editor/Whiteboard";
import { useIsMobile } from "../hooks/useIsMobile";

import { saveProgress, updateStreak } from "../services/firestoreProgress";
import { markFocusSolved } from "../services/focusService";

/* ── Decode JWT to get user email (no extra API call needed) ── */
const getEmailFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email || payload.sub || null;
  } catch { return null; }
};

const fmtTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const LANG_META = {
  javascript: { color: "#fbbf24", label: "JS"   },
  python:     { color: "#34d399", label: "PY"   },
  java:       { color: "#f472b6", label: "JAVA"  },
  cpp:        { color: "#22d3ee", label: "C++"   },
};

const CodeEditor = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [problem,       setProblem]      = useState(null);
  const [code,          setCode]         = useState("");
  const [result,        setResult]       = useState(null);
  const [language,      setLanguage]     = useState("javascript");
  const [running,       setRunning]      = useState(false);
  const [submitting,    setSubmitting]   = useState(false);
  const [fetchFailed,   setFetchFailed]  = useState(false);
  const [activeDisplay, setActiveDisplay] = useState("00:00");
  const [isFocused,     setIsFocused]    = useState(false);
  const [showWarning,   setShowWarning]  = useState(false);
  const [showDesatWave, setShowDesatWave] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const { isMobile } = useIsMobile();
  const [activeTab, setActiveTab] = useState("code"); // 'problem'|'code'|'output'

  /* ── Resizable panels ── */
  const [colWidth,     setColWidth]     = useState(380);   // left panel px
  const [outputHeight, setOutputHeight] = useState(220);   // output panel px
  const [activePanel,  setActivePanel]  = useState(null);  // 'desc'|'editor'|'output'
  const isDraggingCol = useRef(false);
  const isDraggingRow = useRef(false);
  const dragStartX    = useRef(0);
  const dragStartY    = useRef(0);
  const dragStartVal  = useRef(0);

  const containerRef   = useRef(null);
  const headerRef      = useRef(null);
  const initialMount   = useRef(true);
  const activeTimeRef  = useRef(0);
  const focusStartRef  = useRef(null);
  const timerFrozen    = useRef(false);
  const editorCardRef  = useRef(null);   // ref for the editor card div
  const waveRef        = useRef(null);
  const layoutRef      = useRef(null);

  /* ── Flexible starter code — tries all backend key variants ── */
  const getStarterCode = useCallback((prob, lang) => {
    if (!prob) return "";

    // Dataset format from conversion script: starterCode.javascript / .python / .java / .cpp
    if (prob.starterCode?.[lang])   return prob.starterCode[lang];

    // Raw dataset format: code_snippets.javascript / .python3 / .java / .cpp
    // python is stored as "python3" in some raw datasets
    if (lang === "python") {
      if (prob.code_snippets?.python)  return prob.code_snippets.python;
      if (prob.code_snippets?.python3) return prob.code_snippets.python3;
    }
    if (prob.code_snippets?.[lang])   return prob.code_snippets[lang];
    if (prob.starter_code?.[lang])    return prob.starter_code[lang];

    // Sensible per-language fallback comments
    const FALLBACKS = {
      javascript: "// Write your JavaScript solution here\n",
      python:     "# Write your Python solution here\n",
      java:       "// Write your Java solution here\n",
      cpp:        "// Write your C++ solution here\n",
    };
    return FALLBACKS[lang] || "// Write your solution here\n";
  }, []);

  /* ── Fetch + normalize problem ── */
  useEffect(() => {
    if (!id) return;
    const fetchProblem = async () => {
      try {
        console.log("Fetching:", id);
        const res = await axios.get(`http://localhost:5000/api/questions/${id}`);
        console.log("FULL API RESPONSE:", res.data);

        // Normalize: handle { data: {...} }, { question: {...} }, or flat object
        const raw        = res.data;
        const normalized = raw.data || raw.question || raw;
        console.log("Normalized:", normalized);

        const starterCode = getStarterCode(normalized, language);

        setProblem(normalized);
        setCode(starterCode || "");   // always a string, never undefined
        initialMount.current = false; // unlock language switcher effect only after fetch
      } catch (err) {
        console.error("Problem fetch error:", err);
        setFetchFailed(true);
      }
    };
    fetchProblem();
  }, [id, getStarterCode]);

  /* ── Language change → swap starter code (only after initial fetch) ── */
  useEffect(() => {
    if (initialMount.current) return;
    setCode(getStarterCode(problem, language) || "");
  }, [language, problem, getStarterCode]);

  /* ── Entrance animation (runs once problem is loaded) ── */
  useEffect(() => {
    if (!problem || !containerRef.current) return;
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
      .fromTo(headerRef.current,
        { opacity: 0, y: -24, filter: "blur(8px)" },
        { opacity: 1, y: 0,   filter: "blur(0px)", duration: 0.8 }, "-=0.35"
      )
      .fromTo(".editor-panel",
        { opacity: 0, y: 22, filter: "blur(8px)" },
        { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.7, stagger: 0.12 }, "-=0.55"
      );
  }, [problem]);

  /* ── Active-time ticker — updates display every second, stops when frozen ── */
  useEffect(() => {
    const tick = setInterval(() => {
      if (timerFrozen.current) return;   // paused during submit
      const extra = (isFocused && focusStartRef.current)
        ? (Date.now() - focusStartRef.current) / 1000
        : 0;
      setActiveDisplay(fmtTime(activeTimeRef.current + extra));
    }, 1000);
    return () => clearInterval(tick);
  }, [isFocused]);

  /* ── Monaco focus/blur wired from EditorPanel via onEditorMount ── */
  const handleEditorMount = useCallback((editor) => {
    editor.onDidFocusEditorWidget(() => {
      if (timerFrozen.current) return;
      focusStartRef.current = Date.now();
      setIsFocused(true);
    });
    editor.onDidBlurEditorWidget(() => {
      if (focusStartRef.current) {
        activeTimeRef.current += (Date.now() - focusStartRef.current) / 1000;
        focusStartRef.current = null;
      }
      setIsFocused(false);
    });
  }, []);

  /* ── Shared time guard ── */
  const getCurrentActive = () => {
    let t = activeTimeRef.current;
    if (isFocused && focusStartRef.current) t += (Date.now() - focusStartRef.current) / 1000;
    return t;
  };

  const triggerWarning = () => {
    setShowWarning(true);
    setShowDesatWave(true);
    /* Animate wave outward from editor card center */
    requestAnimationFrame(() => {
      if (!editorCardRef.current || !waveRef.current) return;
      const rect = editorCardRef.current.getBoundingClientRect();
      const cx = ((rect.left + rect.right) / 2 / window.innerWidth * 100).toFixed(1);
      const cy = ((rect.top + rect.bottom) / 2 / window.innerHeight * 100).toFixed(1);
      gsap.fromTo(waveRef.current,
        { clipPath: `circle(0% at ${cx}% ${cy}%)`, opacity: 1 },
        {
          clipPath: `circle(160% at ${cx}% ${cy}%)`,
          opacity:  1,
          duration: 1.5,
          ease:     "power2.out",
          onComplete: () => {
            gsap.to(waveRef.current, { opacity: 0, duration: 1.4, delay: 3.5, ease: "power2.inOut",
              onComplete: () => setShowDesatWave(false),
            });
          },
        }
      );
    });
  };

  /* ── Run code ── */
  const runCode = async () => {
    if (getCurrentActive() < 60) { triggerWarning(); return; }
    try {
      setRunning(true);
      setResult(null);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/code/run",
        { problemId: id, code, language },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      // response is { type:"testcases", results[], allPassed } or { type:"raw", output }
      if (res.data.type === "testcases") {
        setResult(res.data);
      } else {
        setResult(res.data.output || res.data.message || JSON.stringify(res.data));
      }
    } catch (err) {
      setResult("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setRunning(false);
    }
  };

  /* ── Submit code ── */
  const submitCode = async () => {
    /* ── Guard: require at least 60s in editor ── */
    const currentActive = getCurrentActive();
    if (currentActive < 60) { triggerWarning(); return; }


    /* ── Freeze timer immediately on submit ── */
    timerFrozen.current = true;
    if (focusStartRef.current) {
      activeTimeRef.current += (Date.now() - focusStartRef.current) / 1000;
      focusStartRef.current = null;
    }
    setIsFocused(false);

    try {
      setSubmitting(true);
      setResult(null);
      const token  = localStorage.getItem("token");
      const res    = await axios.post(
        "http://localhost:5000/api/submissions/submit",
        {
          problemId: id,
          code,
          language,
          timeTaken: Math.round(currentActive),
          activeTime: Math.round(currentActive),
          whiteboardData: null // We'll attach this later if whiteboard is active
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const verdict = res.data.verdict;
      const submId   = res.data.submissionId;
      setResult({ type: "submit", verdict, passed: res.data.passed, total: res.data.total, submissionId: submId });

      /* ── The backend now atomically updates Progress, Stats, Heatmap, and Streak! ── */
      /* No need for manual saveProgress or updateStreak calls on the client. */

    } catch (err) {
      setResult({
        type: "error",
        message: err.response?.data?.message || err.message
      });
    } finally {
      setSubmitting(false);
      timerFrozen.current = false;   // unfreeze — allow editing again
    }
  };

  const dismissWarning = () => { setShowWarning(false); };

  /* ── Drag-resize helpers ── */
  const startColDrag = (e) => {
    e.preventDefault();
    isDraggingCol.current = true;
    dragStartX.current    = e.clientX;
    dragStartVal.current  = colWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const onMove = (mv) => {
      if (!isDraggingCol.current) return;
      const delta = mv.clientX - dragStartX.current;
      setColWidth(Math.min(600, Math.max(260, dragStartVal.current + delta)));
    };
    const onUp = () => {
      isDraggingCol.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  };

  const startRowDrag = (e) => {
    e.preventDefault();
    isDraggingRow.current = true;
    dragStartY.current    = e.clientY;
    dragStartVal.current  = outputHeight;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    const onMove = (mv) => {
      if (!isDraggingRow.current) return;
      const delta = dragStartY.current - mv.clientY;  // drag up = bigger output
      setOutputHeight(Math.min(520, Math.max(140, dragStartVal.current + delta)));
    };
    const onUp = () => {
      isDraggingRow.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  };

  const onBtnHover = (e, enter, isRun) => {
    const color = isRun ? "rgba(34,211,238,0.45)" : "rgba(52,211,153,0.45)";
    gsap.to(e.currentTarget, {
      scale:     enter ? 1.04 : 1,
      y:         enter ? -2 : 0,
      boxShadow: enter ? `0 8px 28px ${color}` : "none",
      duration:  0.25,
      ease:      "power2.out",
    });
  };

  const diffColor = {
    Easy:   { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)"  },
    Medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.25)"  },
    Hard:   { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
  };

  /* ── Loading / error screens ── */
  if (fetchFailed) return (
    <div style={{
      minHeight:      "100vh",
      background:     "linear-gradient(145deg,#030508 0%,#07091a 45%,#030810 100%)",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      fontFamily:     "'DM Mono',monospace",
      gap:            12,
    }}>
      <p style={{ fontSize: 11, color: "#f87171", letterSpacing: "0.35em" }}>PROBLEM NOT FOUND</p>
      <p style={{ fontSize: 9,  color: "rgba(148,163,184,0.3)", letterSpacing: "0.2em" }}>ID: {id}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!problem || Object.keys(problem).length === 0) return (
    <div style={{
      minHeight:      "100vh",
      background:     "linear-gradient(145deg,#030508 0%,#07091a 45%,#030810 100%)",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      fontFamily:     "'DM Mono',monospace",
      gap:            16,
    }}>
      <div style={{ position: "relative", width: 52, height: 52 }}>
        <div style={{
          position:        "absolute",
          inset:           0,
          borderRadius:    "50%",
          border:          "1.5px solid rgba(167,139,250,0.1)",
          borderTopColor:  "#a78bfa",
          animation:       "spin 1s linear infinite",
        }}/>
        <div style={{
          position:           "absolute",
          inset:              6,
          borderRadius:       "50%",
          border:             "1.5px solid rgba(34,211,238,0.08)",
          borderBottomColor:  "#22d3ee",
          animation:          "spin 1.6s linear infinite reverse",
        }}/>
      </div>
      <p style={{ fontSize: 9, color: "rgba(167,139,250,0.35)", letterSpacing: "0.55em" }}>
        LOADING PROBLEM
      </p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* ── Normalize difficulty casing (easy → Easy) ── */
  const formattedDifficulty = problem.difficulty
    ? problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1).toLowerCase()
    : "Medium";

  const diff     = diffColor[formattedDifficulty] || diffColor.Medium;
  const langMeta = LANG_META[language] || { color: "#a78bfa", label: "CODE" };

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: "var(--font-display)",
        minHeight:  "100vh",
        background: "transparent",
        color:      "#e2e8f0",
        position:   "relative",
        overflow:   "hidden",
      }}
    >
      {/* ── Sticky header ── */}
      <header
        ref={headerRef}
        style={{
          position:       "sticky", top: 0, zIndex: 40,
          display:        "flex", alignItems: "center", justifyContent: "space-between",
          padding:        "12px 24px",
          background:     "rgba(3,4,12,0.88)",
          backdropFilter: "blur(28px) saturate(160%)",
          borderBottom:   "1px solid rgba(255,255,255,0.06)",
          boxShadow:      "0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        {/* Left — back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => navigate(-1)}
            onMouseEnter={(e) => gsap.to(e.currentTarget, { x: -3, duration: 0.18 })}
            onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.25 })}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 9, cursor: "pointer",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(148,163,184,0.6)",
              fontSize: 10, fontFamily: "'DM Mono',monospace", letterSpacing: "0.12em",
            }}
          >
            ← BACK
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(167,139,250,0.08)",
            border:     "1px solid rgba(167,139,250,0.18)",
          }}>
            <span style={{ fontSize: 12, color: "#a78bfa" }}>◈</span>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <p style={{
                fontSize:      8.5,
                letterSpacing: "0.45em",
                color:         "rgba(167,139,250,0.4)",
                fontFamily:    "'DM Mono',monospace",
                margin:        0,
              }}>▸ CODE_EDITOR</p>
              {problem.difficulty && (
                <span style={{
                  fontSize:      8,
                  fontWeight:    700,
                  letterSpacing: "0.15em",
                  padding:       "2px 8px",
                  borderRadius:  100,
                  background:    diff.bg,
                  color:         diff.color,
                  border:        `1px solid ${diff.border}`,
                  fontFamily:    "'DM Mono',monospace",
                }}>
                  {formattedDifficulty.toUpperCase()}
                </span>
              )}
            </div>
            <h1 style={{
              fontSize:              16,
              fontWeight:            800,
              letterSpacing:         "-0.02em",
              margin:                0,
              background:            "linear-gradient(120deg,#f1f5f9 20%,#a78bfa 80%)",
              WebkitBackgroundClip:  "text",
              WebkitTextFillColor:   "transparent",
            }}>
              {problem.title}
            </h1>
           </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            padding:       "5px 10px",
            borderRadius:  8,
            background:    `${langMeta.color}14`,
            border:        `1px solid ${langMeta.color}28`,
            fontSize:      9,
            fontWeight:    700,
            letterSpacing: "0.12em",
            color:         langMeta.color,
            fontFamily:    "'DM Mono',monospace",
          }}>
            {langMeta.label}
          </div>

          <LanguageSwitcher language={language} setLanguage={setLanguage} />

          {/* Whiteboard button */}
          <button
            onClick={() => setShowWhiteboard(true)}
            onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.04, y: -2, boxShadow: "0 8px 28px rgba(167,139,250,0.45)", duration: 0.25, ease: "power2.out" })}
            onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, y: 0, boxShadow: "none", duration: 0.25, ease: "power2.out" })}
            style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
              padding: "9px 16px", borderRadius: 11,
              cursor: "pointer",
              background: "rgba(167,139,250,0.09)",
              color: "#a78bfa",
              border: "1px solid rgba(167,139,250,0.28)",
              fontFamily: "'DM Mono',monospace",
              display: "flex", alignItems: "center", gap: 7,
              backdropFilter: "blur(8px)",
            }}
          >
            ✏ WHITEBOARD
          </button>

          {/* Run button */}
          <button
            onClick={runCode}
            disabled={running}
            onMouseEnter={(e) => onBtnHover(e, true,  true)}
            onMouseLeave={(e) => onBtnHover(e, false, true)}
            style={{
              fontSize:       10,
              fontWeight:     800,
              letterSpacing:  "0.15em",
              padding:        "9px 20px",
              borderRadius:   11,
              cursor:         running ? "not-allowed" : "pointer",
              background:     "rgba(34,211,238,0.09)",
              color:          "#22d3ee",
              border:         "1px solid rgba(34,211,238,0.28)",
              fontFamily:     "'DM Mono',monospace",
              opacity:        running ? 0.6 : 1,
              display:        "flex",
              alignItems:     "center",
              gap:            7,
              backdropFilter: "blur(8px)",
              transition:     "opacity 0.2s",
            }}
          >
            {running ? (
              <span style={{
                width:          9,
                height:         9,
                border:         "1.5px solid rgba(34,211,238,0.3)",
                borderTopColor: "#22d3ee",
                borderRadius:   "50%",
                animation:      "spin 1s linear infinite",
                display:        "inline-block",
              }}/>
            ) : "▷"}
            {running ? "RUNNING" : "RUN"}
          </button>

          {/* Submit button */}
          <button
            onClick={submitCode}
            disabled={submitting}
            onMouseEnter={(e) => onBtnHover(e, true,  false)}
            onMouseLeave={(e) => onBtnHover(e, false, false)}
            style={{
              fontSize:       10,
              fontWeight:     800,
              letterSpacing:  "0.15em",
              padding:        "9px 20px",
              borderRadius:   11,
              cursor:         submitting ? "not-allowed" : "pointer",
              background:     "rgba(52,211,153,0.1)",
              color:          "#34d399",
              border:         "1px solid rgba(52,211,153,0.28)",
              fontFamily:     "'DM Mono',monospace",
              opacity:        submitting ? 0.6 : 1,
              display:        "flex",
              alignItems:     "center",
              gap:            7,
              backdropFilter: "blur(8px)",
              transition:     "opacity 0.2s",
            }}
          >
            {submitting ? (
              <span style={{
                width:             9,
                height:            9,
                border:            "1.5px solid rgba(52,211,153,0.3)",
                borderTopColor:    "#34d399",
                borderRadius:      "50%",
                animation:         "spin 1s linear infinite",
                display:           "inline-block",
              }}/>
            ) : "◆"}
            {submitting ? "SUBMITTING" : "SUBMIT"}
          </button>
        </div>
      </header>

      {/* ── Full-screen desaturation wave (portal to body) ── */}
      {showDesatWave && createPortal(
        <div
          ref={waveRef}
          style={{
            position:       "fixed",
            inset:          0,
            zIndex:         9998,
            pointerEvents:  "none",
            /* Grey + mix-blend-mode:color = desaturate everything beneath */
            background:     "#222",
            mixBlendMode:   "color",
            clipPath:       "circle(0% at 70% 50%)",
          }}
        />,
        document.body
      )}

      {/* ── Mobile tab bar ── */}
      <div className="editor-tab-bar">
        {[{id:"problem",label:"PROBLEM"},{id:"code",label:"CODE"},{id:"output",label:"OUTPUT"}].map(t => (
          <button
            key={t.id}
            className={activeTab === t.id ? "active" : ""}
            onClick={() => setActiveTab(t.id)}
            style={{ color: activeTab===t.id?"#a78bfa":"rgba(148,163,184,0.5)" }}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div
        ref={layoutRef}
        className={isMobile ? "editor-mobile-layout" : ""}
        style={{
          display:  "flex",
          gap:       0,
          padding:  isMobile ? "12px 10px" : "20px 28px",
          height:   isMobile ? "auto" : "calc(100vh - 69px)",
          position: "relative",
          zIndex:   10,
          boxSizing:"border-box",
          overflow: isMobile ? "visible" : "hidden",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        {/* ── Left: Problem description ── */}
        <div
          className={`editor-panel editor-tab-panel${isMobile ? (activeTab==="problem" ? " active" : "") : " active"}`}
          onMouseEnter={() => setActivePanel("desc")}
          onMouseLeave={() => setActivePanel(p => p === "desc" ? null : p)}
          style={{
            width:          isMobile ? "100%" : colWidth,
            flexShrink:     0,
            overflow:       "hidden",
            display:        "flex",
            flexDirection:  "column",
            background:     "linear-gradient(135deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.018) 100%)",
            border:         "1px solid rgba(255,255,255,0.08)",
            borderTop:      "1px solid rgba(255,255,255,0.12)",
            borderRadius:   18,
            backdropFilter: "blur(16px)",
            boxShadow:      "inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.35)",
            position:       "relative",
            zIndex:         activePanel === "desc" ? 20 : 10,
            transition:     "box-shadow 0.2s, z-index 0s",
          }}
        >
          <div style={{
            position:   "sticky",
            top:        0, left:"15%", right:"15%",
            height:     "1px",
            background: "linear-gradient(90deg,transparent,rgba(167,139,250,0.45),transparent)",
            pointerEvents: "none",
          }}/>
          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <ProblemDescription problem={problem} />
          </div>
        </div>

        {/* ── Vertical drag handle ── */}
        {!isMobile && (<div
          onMouseDown={startColDrag}
          style={{ width:"14px", flexShrink:0, cursor:"col-resize", display:"flex", alignItems:"center", justifyContent:"center", zIndex:30 }}
        >
          <div style={{ width:"3px", height:"100%", borderRadius:"2px", background:"rgba(255,255,255,0.06)", transition:"background 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(167,139,250,0.4)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
          />
        </div>)}

        {/* ── Right: Editor + Output ── */}
        <div
          className={`editor-tab-panel${isMobile ? (activeTab==="code"||activeTab==="output" ? " active" : "") : " active"}`}
          style={{
            flex:          1,
            minWidth:      0,
            display:       "flex",
            flexDirection: "column",
            gap:           0,
            overflow:      "hidden",
          }}
        >
          {/* Editor card */}
          <div
            ref={editorCardRef}
            className={`editor-tab-panel${isMobile ? (activeTab==="code" ? " active" : "") : " active"}`}
            onMouseEnter={() => setActivePanel("editor")}
            onMouseLeave={() => setActivePanel(p => p === "editor" ? null : p)}
            style={{
              flex:           1,
              minHeight:      0,
              background:     "linear-gradient(135deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.018) 100%)",
              border:         "1px solid rgba(255,255,255,0.08)",
              borderTop:      "1px solid rgba(255,255,255,0.12)",
              borderRadius:   18,
              backdropFilter: "blur(16px)",
              boxShadow:      "inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.35)",
              overflow:       "hidden",
              position:       "relative",
              isolation:      "isolate",
              zIndex:         activePanel === "editor" ? 20 : 10,
              transition:     "box-shadow 0.2s",
            }}
          >
            <div style={{
              position:"absolute", top:0, left:"15%", right:"15%", height:"1px",
              background:"linear-gradient(90deg,transparent,rgba(34,211,238,0.4),transparent)",
              pointerEvents:"none",
            }}/>
            <EditorPanel
              code={code}
              setCode={(v) => setCode(v ?? "")}
              language={language}
              onEditorMount={handleEditorMount}
              activeDisplay={activeDisplay}
              isFocused={isFocused}
              showWarning={showWarning}
              onDismiss={dismissWarning}
            />
          </div>

          {/* Horizontal drag handle */}
          {!isMobile && (<div
            onMouseDown={startRowDrag}
            style={{ height:"14px", flexShrink:0, cursor:"row-resize", display:"flex", alignItems:"center", justifyContent:"center", zIndex:30 }}
          >
            <div style={{ height:"3px", width:"100%", borderRadius:"2px", background:"rgba(255,255,255,0.06)", transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(34,211,238,0.35)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
            />
          </div>)}

          {/* Output card */}
          <div
            className={`editor-tab-panel${isMobile ? (activeTab==="output" ? " active" : "") : " active"}`}
            onMouseEnter={() => setActivePanel("output")}
            onMouseLeave={() => setActivePanel(p => p === "output" ? null : p)}
            style={{
              height:         isMobile ? 260 : outputHeight,
              flexShrink:     0,
              background:     "linear-gradient(135deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.018) 100%)",
              border:         "1px solid rgba(255,255,255,0.08)",
              borderTop:      "1px solid rgba(255,255,255,0.12)",
              borderRadius:   18,
              backdropFilter: "blur(16px)",
              boxShadow:      "inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.35)",
              overflow:       "hidden",
              position:       "relative",
              zIndex:         activePanel === "output" ? 20 : 10,
              transition:     "box-shadow 0.2s",
            }}
          >
            <div style={{
              position:"absolute", top:0, left:"15%", right:"15%", height:"1px",
              background:"linear-gradient(90deg,transparent,rgba(52,211,153,0.4),transparent)",
              pointerEvents:"none",
            }}/>
            <OutputPanel result={result} problemId={id} />
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Whiteboard overlay */}
      {showWhiteboard && (
        <Whiteboard onClose={() => setShowWhiteboard(false)} />
      )}
    </div>
  );
};

export default CodeEditor;