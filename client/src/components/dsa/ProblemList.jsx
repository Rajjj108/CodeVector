/**
 * ProblemList — cyber edition
 * Renders a table-style card wrapping ProblemCard rows.
 * All logic unchanged (infinite scroll, loading state, "no problems" state).
 */
import ProblemCard from "./ProblemCard";
import Loader from "../Loader";

const ProblemList = ({ displayed, loading, hasMore, activeTopic, updateStatus }) => {
  return (
    <div>
      {/* Table container */}
      <div style={{
        background: "rgba(12,8,28,0.95)",
        border: "1px solid rgba(124,58,237,0.25)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
        position: "relative",
      }}>
        {/* Top shimmer */}
        <div style={{
          position: "absolute", top: 0, left: "5%", right: "5%", height: 1,
          background: "linear-gradient(90deg,transparent,rgba(124,58,237,0.5),transparent)",
          pointerEvents: "none",
        }} />

        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "52px 1fr 100px 160px 56px 64px",
          gap: 12,
          padding: "10px 18px",
          borderBottom: "1px solid rgba(124,58,237,0.2)",
          background: "rgba(124,58,237,0.06)",
        }}>
          {["#", "TITLE", "DIFFICULTY", "TAGS", "STATUS", "ACTION"].map((h) => (
            <span key={h} style={{
              fontSize: 7.5, fontWeight: 800, letterSpacing: "0.35em",
              color: "rgba(167,139,250,0.4)", fontFamily: "'DM Mono',monospace",
            }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {displayed.length > 0 ? (
          displayed.map((problem, index) => (
            <div key={`${problem.id}_${index}`} className="problem-row">
              <ProblemCard problem={problem} updateStatus={updateStatus} />
            </div>
          ))
        ) : !loading ? (
          <div style={{
            textAlign: "center", padding: "52px 0",
          }}>
            <div style={{ fontSize: 22, marginBottom: 10, opacity: 0.18, color: "#a78bfa" }}>◈</div>
            <p style={{
              fontSize: 9, color: "rgba(148,163,184,0.3)",
              letterSpacing: "0.38em", fontFamily: "'DM Mono',monospace",
            }}>NO PROBLEMS FOUND</p>
          </div>
        ) : null}

        {/* Footer */}
        {(displayed.length > 0 || loading) && (
          <div style={{
            padding: "10px 18px",
            borderTop: "1px solid rgba(124,58,237,0.15)",
            background: "rgba(124,58,237,0.03)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{
              fontSize: 8.5, color: "rgba(148,163,184,0.35)",
              fontFamily: "'DM Mono',monospace", letterSpacing: "0.2em",
            }}>
              SHOWING {displayed.length} {activeTopic !== "All" ? activeTopic.toUpperCase() + " " : ""}ENTRIES
            </span>
            {hasMore && !loading && (
              <span style={{
                fontSize: 8.5, color: "rgba(167,139,250,0.45)",
                fontFamily: "'DM Mono',monospace", letterSpacing: "0.18em",
              }}>↓ SCROLL FOR MORE</span>
            )}
            {!hasMore && displayed.length > 0 && (
              <span style={{
                fontSize: 8.5, color: "rgba(52,211,153,0.35)",
                fontFamily: "'DM Mono',monospace", letterSpacing: "0.18em",
              }}>✓ ALL LOADED</span>
            )}
          </div>
        )}
      </div>

      {/* Loading spinner below table */}
      {loading && <div style={{ marginTop: 12 }}><Loader size={13} label="LOADING MORE..." card /></div>}
    </div>
  );
};

export default ProblemList;