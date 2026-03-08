import gsap from "gsap";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTypewriter } from "../layout/TypewriterContext";

const DIFF_CONFIG = {
  Easy:   { color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.22)"  },
  Medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.22)"  },
  Hard:   { color: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.22)" },
};

const TOPIC_COLORS = {
  Array:      "#a78bfa",
  String:     "#22d3ee",
  DP:         "#f472b6",
  Graph:      "#34d399",
  Tree:       "#fbbf24",
  LinkedList: "#38bdf8",
  Sorting:    "#c084fc",
};

const cleanDescription = (raw = "") => {
  if (!raw) return "";
  const cutPatterns = [
    /\n\s*Example\s*1\s*:/i,
    /\n\s*\*\*Example\s*1/i,
    /\n\s*<strong>Example/i,
    /\n\s*Constraints\s*:/i,
    /\n\s*Note\s*:/i,
    /\n\s*Follow.up\s*:/i,
  ];
  let cutIdx = raw.length;
  for (const pat of cutPatterns) {
    const m = raw.search(pat);
    if (m !== -1 && m < cutIdx) cutIdx = m;
  }
  return raw.slice(0, cutIdx).trim();
};

/* ── Typewriter hook ── */
const useTypewriterEffect = (text, enabled) => {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) { setDisplayed(text); return; }
    setDisplayed("");
    let i = 0;
    const speed = Math.max(8, Math.min(22, Math.floor(18000 / (text?.length || 1))));
    timerRef.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timerRef.current);
    }, speed);
    return () => clearInterval(timerRef.current);
  }, [text, enabled]);

  return displayed;
};

/* ── Sub-components ── */
const SectionLabel = ({ label, color = "rgba(34,211,238,0.55)" }) => (
  <p style={{
    fontSize: 9, letterSpacing: "0.38em", color,
    fontFamily: "'DM Mono', monospace", margin: "0 0 10px", fontWeight: 700,
  }}>
    ▸ {label}
  </p>
);

const ExampleBlock = ({ index, inputText, outputText, explanation }) => (
  <div style={{
    background: "rgba(0,0,0,0.28)", border: "1px solid rgba(255,255,255,0.07)",
    borderLeft: "2px solid rgba(34,211,238,0.35)", borderRadius: 10, padding: "12px 16px", marginBottom: 10,
  }}>
    <p style={{ fontSize: 8.5, color: "rgba(148,163,184,0.3)", fontFamily: "'DM Mono', monospace", margin: "0 0 8px", letterSpacing: "0.25em" }}>
      EXAMPLE {index + 1}
    </p>
    <pre style={{ fontSize: 12.5, color: "#94a3b8", margin: 0, fontFamily: "'DM Mono', monospace", lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      <span style={{ color: "rgba(52,211,153,0.85)", fontWeight: 700 }}>Input:    </span>
      <span style={{ color: "#cbd5e1" }}>{inputText  || "—"}</span>
      {"\n"}
      <span style={{ color: "rgba(167,139,250,0.85)", fontWeight: 700 }}>Output:   </span>
      <span style={{ color: "#cbd5e1" }}>{outputText || "—"}</span>
      {explanation && (
        <>
          {"\n"}
          <span style={{ color: "rgba(148,163,184,0.5)", fontWeight: 700 }}>Explain:  </span>
          <span style={{ color: "rgba(203,213,225,0.6)" }}>{explanation}</span>
        </>
      )}
    </pre>
  </div>
);

const ProblemImage = ({ src, alt }) => {
  const [errored, setErrored] = useState(false);
  if (!src || errored) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <img src={src} alt={alt || "Problem diagram"} onError={() => setErrored(true)}
        style={{ maxWidth: "100%", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", display: "block" }} />
    </div>
  );
};

/* ═══════════════════════════════════════════
   ProblemDescription
   ═══════════════════════════════════════════ */
const ProblemDescription = ({ problem }) => {
  const ref = useRef(null);
  const { typewriterEnabled } = useTypewriter();

  const formattedDifficulty = problem?.difficulty
    ? problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1).toLowerCase()
    : "Medium";

  const diff       = DIFF_CONFIG[formattedDifficulty] || DIFF_CONFIG.Medium;
  const topicColor = TOPIC_COLORS[problem?.topic] || "#a78bfa";

  const rawDescription     = problem?.description || problem?.content || problem?.body || "";
  const cleanedDescription = cleanDescription(rawDescription);
  const displayedText      = useTypewriterEffect(cleanedDescription, typewriterEnabled);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 14, filter: "blur(5px)" },
      { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.6, ease: "expo.out" }
    );
  }, [problem?.id]);

  if (!problem) return null;

  const examples    = problem.examples    || [];
  const testCases   = problem.testCases   || [];
  const constraints = problem.constraints || [];
  const hints       = problem.hints       || [];
  const extraTags   = (problem.tags || []).filter((t) => t !== problem.topic);

  const images = (() => {
    if (!problem.images) return [];
    if (Array.isArray(problem.images)) return problem.images;
    if (typeof problem.images === "string") return [problem.images];
    return Object.values(problem.images);
  })();

  return (
    <div
      ref={ref}
      style={{
        fontFamily: "var(--font-display)",
        padding: "24px 24px 32px",
        color: "#e2e8f0",
        height: "100%",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* Breadcrumb */}
      <p style={{ fontSize: 9, letterSpacing: "0.45em", color: "rgba(167,139,250,0.4)", fontFamily: "'DM Mono', monospace", margin: "0 0 10px" }}>
        ▸ PROBLEM_DESCRIPTION
      </p>

      {/* Title */}
      <h1 style={{
        fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em",
        background: "linear-gradient(120deg, #fff 20%, #a78bfa 80%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        margin: "0 0 14px", lineHeight: 1.25,
      }}>
        {problem.title}
      </h1>

      {/* Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        <span style={{
          fontSize: 9.5, fontWeight: 700, letterSpacing: "0.15em",
          padding: "4px 11px", borderRadius: 100,
          background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`,
          fontFamily: "'DM Mono', monospace",
        }}>{formattedDifficulty.toUpperCase()}</span>
        {problem.topic && (
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em",
            padding: "4px 11px", borderRadius: 100,
            background: `${topicColor}14`, color: topicColor,
            border: `1px solid ${topicColor}28`, fontFamily: "'DM Mono', monospace",
          }}>{problem.topic.toUpperCase()}</span>
        )}
        {extraTags.map((tag) => (
          <span key={tag} style={{
            fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
            padding: "3px 9px", borderRadius: 100,
            background: "rgba(255,255,255,0.04)", color: "rgba(148,163,184,0.4)",
            border: "1px solid rgba(255,255,255,0.07)", fontFamily: "'DM Mono', monospace",
          }}>{tag}</span>
        ))}
        {/* Typewriter indicator */}
        {typewriterEnabled && (
          <span style={{
            fontSize: 8, letterSpacing: "0.25em", padding: "3px 9px",
            borderRadius: 100, fontFamily: "'DM Mono',monospace",
            background: "rgba(34,211,238,0.08)", color: "rgba(34,211,238,0.55)",
            border: "1px solid rgba(34,211,238,0.18)", animation: "livepulse 1.5s ease-in-out infinite",
          }}>◈ TYPING</span>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 18 }} />

      {/* Description — typewriter or plain */}
      {cleanedDescription && (
        <p style={{
          fontSize: 13, lineHeight: 1.85, color: "rgba(203,213,225,0.85)",
          margin: "0 0 22px", letterSpacing: "0.01em",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          fontFamily: typewriterEnabled ? "'DM Mono', monospace" : "inherit",
        }}>
          {displayedText}
          {/* Blinking cursor while typing */}
          {typewriterEnabled && displayedText.length < cleanedDescription.length && (
            <span style={{ borderRight: "2px solid #22d3ee", animation: "livepulse 0.7s infinite", marginLeft: 1 }}> </span>
          )}
        </p>
      )}

      {/* Images */}
      {images.map((src, i) => (
        <ProblemImage key={i} src={src} alt={`${problem.title} diagram ${i + 1}`} />
      ))}

      {/* Examples */}
      {examples.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <SectionLabel label="EXAMPLES" color="rgba(34,211,238,0.55)" />
          {examples.map((ex, idx) => (
            <ExampleBlock key={idx} index={idx}
              inputText={ex.inputText  || ex.input  || ""}
              outputText={ex.outputText || ex.output || ""}
              explanation={ex.explanation}
            />
          ))}
        </div>
      )}

      {/* Constraints */}
      {constraints.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <SectionLabel label="CONSTRAINTS" color="rgba(251,191,36,0.55)" />
          <div style={{
            background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)",
            borderLeft: "2px solid rgba(251,191,36,0.35)", borderRadius: 10,
            padding: "12px 16px", display: "flex", flexDirection: "column", gap: 7,
          }}>
            {constraints.map((c, idx) => (
              <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "rgba(251,191,36,0.45)", fontFamily: "'DM Mono', monospace", fontSize: 11, flexShrink: 0, marginTop: 1 }}>·</span>
                <span style={{ fontSize: 12.5, color: "rgba(203,213,225,0.72)", fontFamily: "'DM Mono', monospace", lineHeight: 1.6 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test cases */}
      {testCases.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <SectionLabel label="TEST CASES" color="rgba(52,211,153,0.55)" />
          {testCases.map((tc, idx) => (
            <ExampleBlock key={idx} index={idx}
              inputText={tc.input  || tc.inputText  || ""}
              outputText={tc.output || tc.outputText || ""}
            />
          ))}
        </div>
      )}

      {/* Hints */}
      {hints.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <SectionLabel label="HINTS" color="rgba(167,139,250,0.55)" />
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {hints.map((hint, idx) => (
              <details key={idx}>
                <summary style={{
                  cursor: "pointer", fontSize: 10.5, color: "rgba(167,139,250,0.6)",
                  fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em",
                  padding: "8px 12px", borderRadius: 8,
                  background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.14)",
                  userSelect: "none", display: "flex", alignItems: "center", gap: 8, listStyle: "none",
                }}>
                  <span style={{ opacity: 0.55 }}>💡</span>
                  HINT {idx + 1}
                  <span style={{ opacity: 0.35, marginLeft: "auto", fontSize: 9 }}>click to reveal</span>
                </summary>
                <div style={{
                  marginTop: 5, padding: "10px 14px",
                  background: "rgba(167,139,250,0.04)", border: "1px solid rgba(167,139,250,0.11)",
                  borderRadius: 8, fontSize: 12.5, color: "rgba(203,213,225,0.75)", lineHeight: 1.7,
                  fontFamily: "var(--font-body)",
                }}>{hint}</div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDescription;