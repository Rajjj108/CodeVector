import { useEffect, useRef } from "react";
import gsap from "gsap";
import AIReviewPanel from "../AIReviewPanel";

/**
 * OutputPanel — handles two modes:
 *   1. `result` object with { type:"testcases", results[], allPassed } — from Run button
 *   2. `result` string or { type:"submit", verdict, passed, total } — from Submit button
 *   3. null / empty — idle state
 */
const PASS_COLOR = "#34d399";
const FAIL_COLOR = "#f87171";
const INFO_COLOR = "#22d3ee";

const OutputPanel = ({ result, problemId }) => {
  const ref      = useRef(null);
  const prevKey  = useRef(null);
  const curKey   = result ? JSON.stringify(result).slice(0, 40) : null;

  useEffect(() => {
    if (!ref.current || curKey === prevKey.current) return;
    prevKey.current = curKey;
    gsap.fromTo(ref.current,
      { opacity: 0.3, y: 8 },
      { opacity: 1,   y: 0, duration: 0.45, ease: "expo.out" }
    );
  }, [curKey]);

  /* ── Derive display mode ── */
  const isTestcases = result && typeof result === "object" && result.type === "testcases";
  const isSubmit    = result && typeof result === "object" && (result.verdict || result.type === "submit");
  const isString    = typeof result === "string";
  const isEmpty     = !result;

  const headerColor = isEmpty ? "rgba(148,163,184,0.3)"
    : isTestcases ? (result.allPassed ? PASS_COLOR : FAIL_COLOR)
    : isSubmit    ? (result.verdict === "Accepted" ? PASS_COLOR : FAIL_COLOR)
    : isString    ? (result.toLowerCase().includes("error") ? FAIL_COLOR : PASS_COLOR)
    : INFO_COLOR;

  const headerLabel = isEmpty ? "IDLE"
    : isTestcases ? (result.allPassed ? "ALL PASSED" : "SOME FAILED")
    : isSubmit    ? result.verdict?.toUpperCase()
    : isString    ? (result.toLowerCase().includes("error") ? "ERROR" : "RESULT")
    : "OUTPUT";

  return (
    <div style={{
      fontFamily: "var(--font-display)",
      border: `1px solid ${isEmpty ? "rgba(255,255,255,0.08)" : `${headerColor}35`}`,
      borderRadius: 16, overflow: "hidden",
      backdropFilter: "blur(16px)",
      background: "linear-gradient(135deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.02) 100%)",
      boxShadow: `0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)`,
      height: "100%", display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 16px",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        background:"rgba(0,0,0,0.15)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:10, color:headerColor }}>
            {isEmpty ? "○" : isTestcases ? (result.allPassed ? "◆" : "◈") : "◆"}
          </span>
          <p style={{ fontSize:9, letterSpacing:"0.3em", color:"rgba(148,163,184,0.5)", fontFamily:"'DM Mono',monospace", margin:0 }}>
            OUTPUT
          </p>
        </div>
        {!isEmpty && (
          <span style={{
            fontSize:9, fontWeight:700, letterSpacing:"0.15em",
            padding:"3px 8px", borderRadius:6,
            background:`${headerColor}12`, color:headerColor,
            border:`1px solid ${headerColor}25`, fontFamily:"'DM Mono',monospace",
          }}>
            {headerLabel}
          </span>
        )}
      </div>

      {/* Body — must have minHeight:0 for flex overflow/scroll to work */}
      <div ref={ref} style={{
        flex:1, minHeight:0, padding:"12px 14px", overflowY:"auto",
        background:"rgba(0,0,0,0.2)", display:"flex", flexDirection:"column", gap:8,
      }}>
        {/* ── Idle ── */}
        {isEmpty && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:8, opacity:0.4 }}>
            <span style={{ fontSize:20, color:"rgba(148,163,184,0.3)" }}>▷</span>
            <p style={{ fontSize:10, color:"rgba(148,163,184,0.4)", letterSpacing:"0.25em", fontFamily:"'DM Mono',monospace", margin:0 }}>
              RUN TO SEE RESULTS
            </p>
          </div>
        )}

        {/* ── Test-case cards (Run button) ── */}
        {isTestcases && result.results.map((r, i) => (
          <div key={i} style={{
            borderRadius:10, overflow:"hidden",
            border:`1px solid ${r.passed ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
            background: r.passed ? "rgba(52,211,153,0.04)" : "rgba(248,113,113,0.04)",
          }}>
            {/* Case header */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"7px 12px",
              background: r.passed ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
            }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:"0.2em", color:"rgba(148,163,184,0.5)" }}>
                CASE {i + 1}
              </span>
              <span style={{
                fontFamily:"'DM Mono',monospace", fontSize:9, fontWeight:700, letterSpacing:"0.15em",
                color: r.passed ? PASS_COLOR : FAIL_COLOR,
              }}>
                {r.passed ? "✓ PASSED" : r.error ? "✗ ERROR" : "✗ WRONG"}
              </span>
            </div>
            {/* Case body */}
            <div style={{ padding:"8px 12px", display:"flex", flexDirection:"column", gap:5 }}>
              <Row label="Input"    value={r.input}    color="rgba(148,163,184,0.7)" />
              <Row label="Expected" value={r.expected} color={PASS_COLOR} />
              <Row label="Output"   value={r.error ? `Error: ${r.error}` : r.actual}
                   color={r.passed ? PASS_COLOR : FAIL_COLOR} />
            </div>
          </div>
        ))}

        {/* ── Submit verdict ── */}
        {isSubmit && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <div style={{
              padding:"16px 18px", borderRadius:12,
              background: result.verdict === "Accepted" ? "rgba(52,211,153,0.07)" : "rgba(248,113,113,0.07)",
              border:`1px solid ${result.verdict === "Accepted" ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
            }}>
              <p style={{
                fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, margin:"0 0 6px",
                color: result.verdict === "Accepted" ? PASS_COLOR : FAIL_COLOR,
              }}>{result.verdict === "Accepted" ? "✓  Accepted" : "✗  " + result.verdict}</p>
              {result.passed !== undefined && (
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"rgba(148,163,184,0.5)", margin:0, letterSpacing:"0.1em" }}>
                  {result.passed}/{result.total} test cases passed
                </p>
              )}
            </div>
            
            {/* ── AI Review Component ── */}
            {result.verdict === "Accepted" && (
              <AIReviewPanel 
                problemId={problemId} 
                submissionId={result.submissionId} 
                verdict={result.verdict} 
              />
            )}
          </div>
        )}

        {/* ── Raw string output (fallback) ── */}
        {isString && (
          <pre style={{
            fontSize:12, lineHeight:1.7, margin:0,
            color: result.toLowerCase().includes("error") ? "#fca5a5" : "#86efac",
            fontFamily:"'DM Mono',monospace",
            whiteSpace:"pre-wrap", wordBreak:"break-word",
          }}>{result}</pre>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value, color }) => (
  <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
    <span style={{
      fontFamily:"'DM Mono',monospace", fontSize:8.5, letterSpacing:"0.15em",
      color:"rgba(148,163,184,0.35)", flexShrink:0, paddingTop:2, width:56,
    }}>{label}</span>
    <span style={{
      fontFamily:"'DM Mono',monospace", fontSize:11, color, lineHeight:1.5,
      wordBreak:"break-all",
    }}>{value}</span>
  </div>
);

export default OutputPanel;