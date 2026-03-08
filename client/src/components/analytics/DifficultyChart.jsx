import { useEffect, useState } from "react";
import { getAvgDifficulty } from "../../api/analyticsApi";

const DifficultyChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Graceful error handling in case endpoint isn't ready
    getAvgDifficulty()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setData(res.data);
        }
      })
      .catch(() => {
        /* fail silently */
      });
  }, []);

  // Safe fallback if data is empty
  const chartData = data.length > 0 ? data : [
    { _id: "Easy", avgTime: 0 },
    { _id: "Medium", avgTime: 0 },
    { _id: "Hard", avgTime: 0 },
  ];
  
  const maxTime = Math.max(...chartData.map(d => d.avgTime || 1));

  const COLORS = {
    Easy:   { color: "#34d399", glow: "rgba(52,211,153,0.3)" },
    Medium: { color: "#fbbf24", glow: "rgba(251,191,36,0.3)" },
    Hard:   { color: "#f87171", glow: "rgba(248,113,113,0.3)" },
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <p style={{
        fontSize: 10, color: "rgba(148,163,184,0.5)",
        fontFamily: "'DM Mono',monospace", margin: "0 0 16px",
      }}>AVG TIME / DIFFICULTY</p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, justifyContent: "center" }}>
        {chartData.map((d) => {
          const cfg = COLORS[d._id] || COLORS.Medium;
          const pct = Math.max((d.avgTime / maxTime) * 100, 5); // min 5% width for visibility
          return (
            <div key={d._id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{
                width: 44, fontSize: 9, color: "rgba(148,163,184,0.7)",
                fontFamily: "'DM Mono',monospace"
              }}>{d._id}</span>
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 999 }}>
                <div style={{
                  height: "100%", width: `${pct}%`, background: cfg.color, borderRadius: 999,
                  boxShadow: `0 0 8px ${cfg.glow}`, transition: "width 1s ease"
                }} />
              </div>
              <span style={{
                width: 40, textAlign: "right", fontSize: 11, fontWeight: 700, color: cfg.color
              }}>{Math.round(d.avgTime)}s</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DifficultyChart;