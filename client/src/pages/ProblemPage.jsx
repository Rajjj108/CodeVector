import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { submitCodeApi } from "../api/submissionApi";
import axios from "axios";
import EditorPanel from "../components/EditorPanel";
import Loader from "../components/Loader";
import AIReviewPanel from "../components/AIReviewPanel";

const ProblemPage = () => {
  const { id: paramId } = useParams();
  const problemId = paramId || "demoProblemId";

  const [problem,     setProblem]     = useState(null);
  const [loading,     setLoading]     = useState(true);          // FIX 1: named loading state
  const [code,        setCode]        = useState("");
  const [language,    setLanguage]    = useState("javascript");  // FIX 2: language is now stateful + defaults to "javascript"
  const [verdict,     setVerdict]     = useState(null);
  const [selfSolved,  setSelfSolved]  = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeTime,  setActiveTime]  = useState(0);
  const [streak,      setStreak]      = useState(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [submissionId, setSubmissionId]       = useState(null);

  const activeStartRef = useRef(null);
  const startTimeRef   = useRef(null);
  const containerRef   = useRef(null);
  const orb1Ref        = useRef(null);
  const orb2Ref        = useRef(null);

  /* ── Fetch problem by ID ── */
  useEffect(() => {
    if (!problemId || problemId === "demoProblemId") {
      setLoading(false);
      return;
    }
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/questions/${problemId}`);
        const prob = res.data;
        setProblem({
          ...prob,
          topic: prob.topics?.[0] || "Other",
        });
        // FIX 3: seed editor with starter code using the correct language key
        const starter = prob.starterCode?.[language] || prob.code_snippets?.[language] || "";
        setCode(starter);
      } catch (err) {
        console.error("Problem fetch error:", err);
      } finally {
        setLoading(false); // FIX 1: always clears loading
      }
    };
    fetchProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  // FIX 4: update editor code when language changes (after problem is loaded)
  useEffect(() => {
    if (problem) {
      const starter = problem.starterCode?.[language] || problem.code_snippets?.[language] || "";
      setCode(starter);
    }
  }, [language, problem]);

  /* ── Solve timer ── */
  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ── Entrance animation ── */
  useEffect(() => {
    if (!containerRef.current) return;
    const gsapModule = window.gsap;
    if (!gsapModule) return;
    gsapModule.fromTo(containerRef.current,
      { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "expo.out" }
    );
    gsapModule.fromTo(".pp-panel",
      { opacity: 0, y: 24, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, stagger: 0.12, ease: "expo.out", delay: 0.2 }
    );
    if (orb1Ref.current) gsapModule.to(orb1Ref.current, { y: -22, x: 12, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" });
    if (orb2Ref.current) gsapModule.to(orb2Ref.current, { y: 18,  x: -14, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, []);

  /* ── Active tracking ── */
  const handleFocus = useCallback(() => {
    activeStartRef.current = Date.now();
    setIsEditorFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditorFocused(false);
    if (activeStartRef.current) {
      setActiveTime(prev => prev + Math.floor((Date.now() - activeStartRef.current) / 1000));
      activeStartRef.current = null;
    }
  }, []);

  /* ── Submit ── */
  const handleSubmit = useCallback(async () => {
    try {
      const finalActiveTime = activeStartRef.current
        ? activeTime + Math.floor((Date.now() - activeStartRef.current) / 1000)
        : activeTime;

      const res = await submitCodeApi({
        problemId,
        code,
        language,
        timeTaken:  elapsedTime,
        activeTime: finalActiveTime,
      });

      setVerdict(res.verdict);
      setSelfSolved(res.selfSolved);
      setSubmissionId(res.submissionId);

      if (res.verdict === "Accepted" && res.selfSolved) {
        // Dispatch event so StreakContext refetches immediately
        window.dispatchEvent(new Event("streak:refresh"));

        // Also update local streak state for this component
        const token = localStorage.getItem("token");
        const updated = await axios.get("/api/dashboard/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStreak(updated.data.streak);
      }
    } catch (error) {
      console.error("Submission failed:", error);
    }
  }, [problemId, code, language, elapsedTime, activeTime]);

  /* ── Format time ── */
  const fmtTime = (s) => {
    const m   = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const verdictStyle = verdict === "Accepted"
    ? { color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.25)",  icon: "✓" }
    : { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", icon: "✗" };

  // FIX 1: Show loading/not-found states instead of blank/broken page
  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(145deg,#030508 0%,#07091a 45%,#030810 100%)",
    }}>
      <Loader size={18} label="LOADING PROBLEM..." />
    </div>
  );

  if (!problem && problemId !== "demoProblemId") return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(145deg,#030508 0%,#07091a 45%,#030810 100%)",
      color: "#f87171", fontFamily: "'DM Mono', monospace", fontSize: 14, letterSpacing: "0.1em",
    }}>
      ✗ Problem not found
    </div>
  );

  // FIX 5: Language selector options
  const LANGUAGES = [
    { key: "javascript", label: "JS",     color: "#fbbf24" },
    { key: "python",     label: "Python", color: "#34d399" },
    { key: "java",       label: "Java",   color: "#f87171" },
    { key: "cpp",        label: "C++",    color: "#a78bfa" },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily:"var(--font-display)",
        minHeight:"100vh",
        background:"linear-gradient(145deg,#030508 0%,#07091a 45%,#030810 100%)",
        color:"#e2e8f0",
        position:"relative",
        overflow:"hidden",
        display:"flex",
        flexDirection:"column",
      }}
    >
      {/* Orbs */}
      <div ref={orb1Ref} style={{
        position:"fixed",top:"8%",left:"8%",width:380,height:380,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(124,58,237,0.09) 0%,transparent 65%)",
        filter:"blur(55px)",pointerEvents:"none",zIndex:0,
      }}/>
      <div ref={orb2Ref} style={{
        position:"fixed",bottom:"10%",right:"6%",width:300,height:300,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(34,211,238,0.07) 0%,transparent 65%)",
        filter:"blur(50px)",pointerEvents:"none",zIndex:0,
      }}/>

      {/* Grid */}
      <div style={{
        position:"fixed",inset:0,zIndex:0,opacity:0.02,pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
        backgroundSize:"72px 72px",
      }}/>

      {/* ── Header ── */}
      <header style={{
        position:"sticky",top:0,zIndex:40,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"14px 32px",
        background:"linear-gradient(180deg,rgba(3,5,8,0.98) 0%,rgba(3,5,8,0.86) 100%)",
        backdropFilter:"blur(28px) saturate(160%)",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{
            width:32,height:32,borderRadius:10,
            display:"flex",alignItems:"center",justifyContent:"center",
            background:"rgba(167,139,250,0.1)",
            border:"1px solid rgba(167,139,250,0.2)",
          }}>
            <span style={{ fontSize:13,color:"#a78bfa" }}>◈</span>
          </div>
          <div>
            <p style={{
              fontSize:8.5,letterSpacing:"0.45em",
              color:"rgba(167,139,250,0.4)",
              fontFamily:"'DM Mono',monospace",margin:0,marginBottom:3,
            }}>▸ PROBLEM_PAGE</p>
            <h1 style={{
              fontSize:15,fontWeight:800,letterSpacing:"-0.02em",margin:0,
              background:"linear-gradient(120deg,#f1f5f9 20%,#a78bfa 80%)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            }}>
              {problem ? problem.title : "Code Submission"}
            </h1>
          </div>
        </div>

        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          {/* FIX 5: Language selector in header */}
          <div style={{ display:"flex",gap:4 }}>
            {LANGUAGES.map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setLanguage(key)}
                style={{
                  fontSize:9,fontWeight:700,letterSpacing:"0.1em",
                  padding:"5px 11px",borderRadius:100,cursor:"pointer",
                  fontFamily:"'DM Mono',monospace",
                  background: language === key ? `${color}18` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${language === key ? `${color}40` : "rgba(255,255,255,0.08)"}`,
                  color: language === key ? color : "rgba(148,163,184,0.4)",
                  transition:"all 0.2s",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{
            display:"flex",alignItems:"center",gap:8,
            padding:"8px 16px",borderRadius:100,
            background:"rgba(167,139,250,0.08)",
            border:"1px solid rgba(167,139,250,0.2)",
          }}>
            <span style={{ fontSize:11,color:"rgba(167,139,250,0.6)" }}>⏱</span>
            <span style={{
              fontSize:12,fontWeight:700,color:"#a78bfa",
              fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",
            }}>
              {fmtTime(elapsedTime)}
            </span>
          </div>
          <div style={{
            display:"flex",alignItems:"center",gap:8,
            padding:"8px 16px",borderRadius:100,
            background:isEditorFocused ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.04)",
            border:`1px solid ${isEditorFocused ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.08)"}`,
            transition:"all 0.3s",
          }}>
            <span style={{ fontSize:11,color:isEditorFocused ? "#34d399" : "rgba(148,163,184,0.4)" }}>🧠</span>
            <span style={{
              fontSize:12,fontWeight:700,
              color:isEditorFocused ? "#34d399" : "rgba(148,163,184,0.5)",
              fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",
            }}>
              {fmtTime(activeTime)}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <div style={{
        flex:1,display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gap:20,padding:"24px 32px",
        position:"relative",zIndex:10,
        boxSizing:"border-box",
      }}>

        {/* ── Left: Editor + problem info ── */}
        <div className="pp-panel" style={{ display:"flex",flexDirection:"column",gap:14 }}>

          {/* Problem info card */}
          {problem && (
            <div style={{
              background:"linear-gradient(135deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.02) 100%)",
              border:"1px solid rgba(255,255,255,0.08)",
              borderTop:"1px solid rgba(255,255,255,0.13)",
              borderRadius:16,padding:"16px 20px",
              backdropFilter:"blur(16px)",
              position:"relative",overflow:"hidden",maxHeight:220,overflowY:"auto",
            }}>
              <div style={{
                position:"absolute",top:0,left:"15%",right:"15%",height:"1px",
                background:"linear-gradient(90deg,transparent,rgba(167,139,250,0.4),transparent)",
                pointerEvents:"none",
              }}/>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                <span style={{
                  fontSize:9,fontWeight:700,letterSpacing:"0.15em",
                  padding:"3px 10px",borderRadius:100,
                  background: problem.difficulty === "Easy"
                    ? "rgba(52,211,153,0.1)" : problem.difficulty === "Hard"
                    ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)",
                  color: problem.difficulty === "Easy"
                    ? "#34d399" : problem.difficulty === "Hard"
                    ? "#f87171" : "#fbbf24",
                  border: `1px solid ${problem.difficulty === "Easy"
                    ? "rgba(52,211,153,0.25)" : problem.difficulty === "Hard"
                    ? "rgba(248,113,113,0.25)" : "rgba(251,191,36,0.25)"}`,
                  fontFamily:"'DM Mono',monospace",
                }}>
                  {(problem.difficulty || "Medium").toUpperCase()}
                </span>
                {problem.topics?.map((t) => (
                  <span key={t} style={{
                    fontSize:9,padding:"2px 8px",borderRadius:100,
                    background:"rgba(167,139,250,0.08)",
                    border:"1px solid rgba(167,139,250,0.18)",
                    color:"rgba(167,139,250,0.7)",
                    fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",
                  }}>{t}</span>
                ))}
              </div>
              <p style={{
                fontSize:12,color:"rgba(203,213,225,0.75)",lineHeight:1.6,margin:0,
                fontFamily:"var(--font-body)",
              }}>
                {problem.description?.substring(0, 300)}{problem.description?.length > 300 ? "..." : ""}
              </p>
            </div>
          )}

          {/* FIX 6: Monaco EditorPanel replaces raw textarea */}
          <div style={{ flex:1, minHeight: 300 }}>
            <EditorPanel
              code={code}
              setCode={(v) => setCode(v || "")}  // FIX 7: guard against undefined from Monaco
              language={language}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(52,211,153,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(52,211,153,0.25)";
            }}
            style={{
              width:"100%",padding:"15px",
              background:"linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%)",
              border:"none",borderRadius:14,
              color:"#fff",
              fontFamily:"var(--font-display)",
              fontSize:13,fontWeight:700,letterSpacing:"0.1em",
              cursor:"pointer",
              boxShadow:"0 4px 24px rgba(52,211,153,0.25)",
              transition:"transform 0.2s, box-shadow 0.3s",
              position:"relative",overflow:"hidden",
            }}
          >
            <span style={{ position:"relative",zIndex:1 }}>◆ Submit Code</span>
          </button>
        </div>

        {/* ── Right: Result + stats ── */}
        <div className="pp-panel" style={{ display:"flex",flexDirection:"column",gap:14 }}>

          {/* Examples */}
          {problem?.examples?.length > 0 && !verdict && (
            <div style={{
              background:"linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.015) 100%)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:18,padding:"16px 20px",
              backdropFilter:"blur(12px)",
            }}>
              <p style={{
                fontSize:8.5,letterSpacing:"0.3em",
                color:"rgba(148,163,184,0.35)",
                fontFamily:"'DM Mono',monospace",margin:"0 0 12px",
              }}>▸ EXAMPLES</p>
              {problem.examples.slice(0, 2).map((ex, i) => (
                <div key={i} style={{
                  marginBottom:10,padding:"10px 12px",borderRadius:10,
                  background:"rgba(255,255,255,0.03)",
                  border:"1px solid rgba(255,255,255,0.05)",
                }}>
                  <p style={{ fontSize:11,color:"rgba(148,163,184,0.5)",fontFamily:"'DM Mono',monospace",margin:"0 0 4px" }}>
                    Example {i + 1}
                  </p>
                  {ex.input !== undefined && (
                    <p style={{ fontSize:11.5,color:"#cbd5e1",fontFamily:"'DM Mono',monospace",margin:"0 0 2px" }}>
                      <span style={{ color:"rgba(167,139,250,0.6)" }}>Input: </span>{String(ex.input)}
                    </p>
                  )}
                  {ex.output !== undefined && (
                    <p style={{ fontSize:11.5,color:"#cbd5e1",fontFamily:"'DM Mono',monospace",margin:0 }}>
                      <span style={{ color:"rgba(52,211,153,0.6)" }}>Output: </span>{String(ex.output)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Verdict card */}
          {verdict ? (
            <div style={{
              background:verdictStyle.bg,
              border:`1px solid ${verdictStyle.border}`,
              borderTop:`1px solid ${verdictStyle.border.replace("0.25","0.45")}`,
              borderRadius:20,padding:"24px",
              backdropFilter:"blur(16px)",
              boxShadow:`0 8px 32px rgba(0,0,0,0.3), 0 0 30px ${verdictStyle.bg}`,
              position:"relative",overflow:"hidden",
            }}>
              <div style={{
                position:"absolute",top:0,left:"10%",right:"10%",height:"1px",
                background:`linear-gradient(90deg,transparent,${verdictStyle.color}60,transparent)`,
              }}/>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16 }}>
                <div style={{
                  width:40,height:40,borderRadius:12,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background:`${verdictStyle.color}18`,
                  border:`1px solid ${verdictStyle.color}35`,
                  fontSize:18,color:verdictStyle.color,
                  boxShadow:`0 0 20px ${verdictStyle.color}30`,
                }}>
                  {verdictStyle.icon}
                </div>
                <div>
                  <p style={{
                    fontSize:8.5,letterSpacing:"0.35em",
                    color:verdictStyle.color,opacity:0.6,
                    fontFamily:"'DM Mono',monospace",margin:"0 0 3px",
                  }}>VERDICT</p>
                  <h3 style={{
                    fontSize:22,fontWeight:900,letterSpacing:"-0.03em",
                    color:verdictStyle.color,margin:0,
                    fontFamily:"var(--font-display)",
                  }}>
                    {verdict}
                  </h3>
                </div>
              </div>

              <div style={{ display:"flex",gap:12 }}>
                <div style={{
                  flex:1,padding:"12px 14px",borderRadius:12,
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.07)",
                }}>
                  <p style={{
                    fontSize:8,letterSpacing:"0.25em",
                    color:"rgba(148,163,184,0.4)",fontFamily:"'DM Mono',monospace",margin:"0 0 4px",
                  }}>TIME TAKEN</p>
                  <p style={{ fontSize:16,fontWeight:800,color:"#e2e8f0",margin:0,fontFamily:"var(--font-display)" }}>
                    {fmtTime(elapsedTime)}
                  </p>
                </div>
                <div style={{
                  flex:1,padding:"12px 14px",borderRadius:12,
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.07)",
                }}>
                  <p style={{
                    fontSize:8,letterSpacing:"0.25em",
                    color:"rgba(148,163,184,0.4)",fontFamily:"'DM Mono',monospace",margin:"0 0 4px",
                  }}>ACTIVE TIME</p>
                  <p style={{ fontSize:16,fontWeight:800,color:"#e2e8f0",margin:0,fontFamily:"var(--font-display)" }}>
                    {fmtTime(activeTime)}
                  </p>
                </div>
              </div>

              {!selfSolved && (
                <div style={{
                  marginTop:14,padding:"10px 14px",borderRadius:10,
                  background:"rgba(251,191,36,0.08)",
                  border:"1px solid rgba(251,191,36,0.2)",
                  display:"flex",alignItems:"center",gap:8,
                }}>
                  <span style={{ fontSize:12,color:"#fbbf24" }}>⚠</span>
                  <span style={{ fontSize:11,color:"rgba(251,191,36,0.8)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em" }}>
                    Not counted for streak — solve time too low.
                  </span>
                </div>
              )}

              {/* Standalone AI Review Component */}
              <AIReviewPanel problemId={problemId} submissionId={submissionId} verdict={verdict} />

            </div>
          ) : (
            <div style={{
              flex:1,
              background:"linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.015) 100%)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:20,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              gap:14,padding:"48px 24px",
              backdropFilter:"blur(12px)",
            }}>
              <div style={{
                width:56,height:56,borderRadius:16,
                display:"flex",alignItems:"center",justifyContent:"center",
                background:"rgba(167,139,250,0.08)",
                border:"1px solid rgba(167,139,250,0.18)",
                fontSize:24,color:"rgba(167,139,250,0.3)",
              }}>◈</div>
              <div style={{ textAlign:"center" }}>
                <p style={{
                  fontSize:12,fontWeight:700,letterSpacing:"0.2em",
                  color:"rgba(148,163,184,0.3)",fontFamily:"'DM Mono',monospace",
                  margin:"0 0 6px",
                }}>AWAITING SUBMISSION</p>
                <p style={{ fontSize:11.5,color:"rgba(148,163,184,0.2)",fontWeight:300 }}>
                  Write your solution and hit Submit
                </p>
              </div>
            </div>
          )}

          {/* Streak card */}
          {streak && (
            <div style={{
              background:"linear-gradient(135deg,rgba(251,191,36,0.1) 0%,rgba(251,191,36,0.04) 100%)",
              border:"1px solid rgba(251,191,36,0.22)",
              borderTop:"1px solid rgba(251,191,36,0.4)",
              borderRadius:20,padding:"20px 24px",
              backdropFilter:"blur(16px)",
              boxShadow:"0 8px 32px rgba(0,0,0,0.3)",
              display:"flex",alignItems:"center",gap:16,
              position:"relative",overflow:"hidden",
            }}>
              <div style={{
                position:"absolute",top:0,left:"10%",right:"10%",height:"1px",
                background:"linear-gradient(90deg,transparent,rgba(251,191,36,0.55),transparent)",
              }}/>
              <div style={{
                width:48,height:48,borderRadius:14,
                display:"flex",alignItems:"center",justifyContent:"center",
                background:"rgba(251,191,36,0.12)",
                border:"1px solid rgba(251,191,36,0.25)",
                fontSize:22,
                boxShadow:"0 0 20px rgba(251,191,36,0.2)",
              }}>🔥</div>
              <div>
                <p style={{
                  fontSize:8.5,letterSpacing:"0.35em",
                  color:"rgba(251,191,36,0.55)",
                  fontFamily:"'DM Mono',monospace",margin:"0 0 3px",
                }}>CURRENT STREAK</p>
                <p style={{
                  fontSize:26,fontWeight:900,letterSpacing:"-0.04em",
                  color:"#fbbf24",margin:0,fontFamily:"var(--font-display)",
                }}>
                  {streak.current} <span style={{ fontSize:14,fontWeight:600,color:"rgba(251,191,36,0.6)" }}>days</span>
                </p>
              </div>
            </div>
          )}

          {/* Session stats card */}
          <div style={{
            background:"linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.015) 100%)",
            border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:18,padding:"16px 20px",
            backdropFilter:"blur(12px)",
          }}>
            <p style={{
              fontSize:8.5,letterSpacing:"0.3em",
              color:"rgba(148,163,184,0.35)",
              fontFamily:"'DM Mono',monospace",margin:"0 0 12px",
            }}>▸ SESSION_STATS</p>
            <div style={{ display:"flex",gap:14 }}>
              <div style={{ flex:1 }}>
                <p style={{
                  fontSize:8.5,letterSpacing:"0.2em",
                  color:"rgba(167,139,250,0.4)",
                  fontFamily:"'DM Mono',monospace",margin:"0 0 4px",
                }}>SOLVE TIME</p>
                <p style={{
                  fontSize:20,fontWeight:900,
                  color:"#a78bfa",margin:0,
                  fontFamily:"var(--font-display)",letterSpacing:"-0.03em",
                }}>
                  {fmtTime(elapsedTime)}
                </p>
              </div>
              <div style={{ width:"1px",background:"rgba(255,255,255,0.07)" }}/>
              <div style={{ flex:1 }}>
                <p style={{
                  fontSize:8.5,letterSpacing:"0.2em",
                  color:"rgba(52,211,153,0.4)",
                  fontFamily:"'DM Mono',monospace",margin:"0 0 4px",
                }}>ACTIVE CODING</p>
                <p style={{
                  fontSize:20,fontWeight:900,
                  color:isEditorFocused ? "#34d399" : "rgba(52,211,153,0.6)",
                  margin:0,
                  fontFamily:"var(--font-display)",letterSpacing:"-0.03em",
                  transition:"color 0.3s",
                }}>
                  {fmtTime(activeTime)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800;900&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');
        textarea::placeholder{color:rgba(148,163,184,0.22);}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(167,139,250,0.18);border-radius:999px;}
        *{scrollbar-width:thin;scrollbar-color:rgba(167,139,250,0.18) transparent;}
      `}</style>
    </div>
  );
};

export default ProblemPage;