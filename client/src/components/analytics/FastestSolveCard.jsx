import { useEffect, useState } from "react";
import { getFastestSolve } from "../../api/analyticsApi";

const FastestSolveCard = () => {
  const [fastest, setFastest] = useState(null);

  useEffect(() => {
    getFastestSolve()
      .then((res) => setFastest(res.data))
      .catch(() => {});
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <p style={{
        fontSize: 10, color: "rgba(148,163,184,0.5)",
        fontFamily: "'DM Mono',monospace", margin: "0 0 8px",
      }}>⚡ FASTEST SOLVE</p>
      
      {fastest ? (
        <>
          <p style={{
            fontSize: 14, fontWeight: 700, color: "#e2e8f0", margin: "0 0 4px",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>{fastest.problemId?.title || "Unknown"}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              fontSize: 18, fontWeight: 800, color: "#22d3ee", fontFamily: "var(--font-display)"
            }}>{fastest.timeTaken}</span>
            <span style={{
              fontSize: 10, color: "rgba(34,211,238,0.5)", fontFamily: "'DM Mono',monospace"
            }}>SEC</span>
          </div>
        </>
      ) : (
        <p style={{ fontSize: 12, color: "rgba(148,163,184,0.3)", fontFamily: "'DM Mono',monospace", margin: 0 }}>
          No data yet
        </p>
      )}
    </div>
  );
};

export default FastestSolveCard;