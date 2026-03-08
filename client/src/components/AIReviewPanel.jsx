import { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000");

const AIReviewPanel = ({ problemId, submissionId }) => {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAi,  setLoadingAi]  = useState(false);
  const [error,      setError]      = useState(null);
  const panelRef = useRef(null);
  const btnRef   = useRef(null);

  /* Animate panel in when analysis loads */
  useEffect(() => {
    if (aiAnalysis && panelRef.current) {
      gsap.fromTo(panelRef.current,
        { opacity: 0, y: 14, filter: "blur(6px)" },
        { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.55, ease: "expo.out" }
      );
    }
  }, [aiAnalysis]);

  /* Don't render at all if there's no valid submissionId */
  if (!submissionId) return null;

  const fetchAIReview = async () => {
    setLoadingAi(true);
    setError(null);
    /* button pulse-out */
    if (btnRef.current) gsap.to(btnRef.current, { scale: 0.96, duration: 0.1, yoyo: true, repeat: 1 });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/api/ai/analyze`, {
        problemId,
        submissionId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAiAnalysis(res.data);
    } catch (err) {
      console.error("AI Review error:", err);
      setError(err?.response?.data?.message || "AI analysis failed. Please try again.");
    } finally {
      setLoadingAi(false);
    }
  };

  /* ── Section card ── */
  const Section = ({ label, children }) => (
    <div style={{
      background: "rgba(255,255,255,0.025)",
      padding: "14px 16px",
      borderRadius: 14,
      border: "1px solid rgba(167,139,250,0.08)",
    }}>
      <p style={{
        fontSize: 8.5, letterSpacing: "0.3em",
        color: "rgba(167,139,250,0.45)", margin: "0 0 8px",
        fontFamily: "'DM Mono',monospace", fontWeight: 700,
      }}>{label}</p>
      {children}
    </div>
  );

  return (
    <div style={{ marginTop: 16 }}>

      {/* ── Trigger button ── */}
      {!aiAnalysis && (
        <button
          ref={btnRef}
          onClick={fetchAIReview}
          disabled={loadingAi}
          style={{
            width: "100%", padding: "13px 16px", borderRadius: 14,
            background: "linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(139,92,246,0.06) 100%)",
            border: "1px solid rgba(167,139,250,0.35)",
            color: "#c4b5fd",
            fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 11,
            letterSpacing: "0.18em",
            cursor: loadingAi ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "border-color 0.2s, box-shadow 0.2s",
            opacity: loadingAi ? 0.75 : 1,
          }}
          onMouseEnter={e => { if (!loadingAi) { e.currentTarget.style.borderColor = "rgba(167,139,250,0.65)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(167,139,250,0.18)"; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(167,139,250,0.35)"; e.currentTarget.style.boxShadow = "none"; }}
        >
          {loadingAi ? (
            <>
              <span style={{
                width: 10, height: 10, border: "1.5px solid rgba(196,181,253,0.25)",
                borderTopColor: "#c4b5fd", borderRadius: "50%",
                display: "inline-block",
                animation: "ai-spin 0.9s linear infinite",
              }} />
              ANALYZING CODE...
            </>
          ) : (
            <>
              <span style={{ fontSize: 14 }}>✦</span>
              AI REVIEW
            </>
          )}
        </button>
      )}

      {/* ── Error state ── */}
      {error && (
        <div style={{
          marginTop: 10, padding: "10px 14px", borderRadius: 12,
          background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.25)",
          fontSize: 11.5, color: "#fca5a5", fontFamily: "'DM Mono',monospace",
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Analysis Panel ── */}
      {aiAnalysis && (
        <div ref={panelRef} style={{
          background: "linear-gradient(160deg, rgba(167,139,250,0.04) 0%, rgba(0,0,0,0) 100%)",
          border: "1px solid rgba(167,139,250,0.18)",
          borderRadius: 18, padding: "20px",
          backdropFilter: "blur(20px)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Top shimmer line */}
          <div style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
            background: "linear-gradient(90deg,transparent,rgba(167,139,250,0.5),transparent)",
            pointerEvents: "none",
          }} />

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, boxShadow: "0 0 16px rgba(167,139,250,0.2)",
            }}>✦</div>
            <div>
              <p style={{ margin: 0, fontSize: 8.5, letterSpacing: "0.3em", color: "rgba(167,139,250,0.5)", fontFamily: "'DM Mono',monospace" }}>GEMINI · AI ANALYSIS</p>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#c4b5fd", letterSpacing: "-0.01em" }}>Code Review</h4>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Time + Space complexity grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Section label="TIME COMPLEXITY">
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#e2e8f0", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                  {aiAnalysis.timeComplexity || "—"}
                </p>
              </Section>
              <Section label="SPACE COMPLEXITY">
                <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#e2e8f0", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                  {aiAnalysis.spaceComplexity || "—"}
                </p>
              </Section>
            </div>

            {/* Improvements */}
            {aiAnalysis.improvements?.length > 0 && (
              <Section label="OPTIMIZATION TIPS">
                <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 5 }}>
                  {aiAnalysis.improvements.map((imp, i) => (
                    <li key={i} style={{ fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.5 }}>{imp}</li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Alternative Approach */}
            {aiAnalysis.alternativeApproach && (
              <Section label="ALTERNATIVE APPROACH">
                <p style={{ margin: 0, fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.6 }}>
                  {aiAnalysis.alternativeApproach}
                </p>
              </Section>
            )}

            {/* Edge Cases */}
            {aiAnalysis.edgeCases?.length > 0 && (
              <Section label="EDGE CASES TO CONSIDER">
                <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 5 }}>
                  {aiAnalysis.edgeCases.map((ec, i) => (
                    <li key={i} style={{ fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.5 }}>{ec}</li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Code Quality */}
            {aiAnalysis.codeQuality?.length > 0 && (
              <Section label="CODE QUALITY">
                <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 5 }}>
                  {aiAnalysis.codeQuality.map((cq, i) => (
                    <li key={i} style={{ fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.5 }}>{cq}</li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Interview Explanation */}
            {aiAnalysis.interviewExplanation && (
              <Section label="INTERVIEW EXPLANATION">
                <p style={{ margin: 0, fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.6 }}>
                  {aiAnalysis.interviewExplanation}
                </p>
              </Section>
            )}

          </div>

          {/* Re-analyze button */}
          <button
            onClick={() => { setAiAnalysis(null); setError(null); }}
            style={{
              marginTop: 14, background: "none", border: "none", cursor: "pointer",
              fontSize: 10, color: "rgba(167,139,250,0.4)", fontFamily: "'DM Mono',monospace",
              letterSpacing: "0.2em", padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#c4b5fd"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(167,139,250,0.4)"}
          >
            ↺ REFRESH ANALYSIS
          </button>
        </div>
      )}

      <style>{`@keyframes ai-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AIReviewPanel;
