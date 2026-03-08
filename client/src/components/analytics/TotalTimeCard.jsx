import { useEffect, useState } from "react";
import { getTotalTime } from "../../api/analyticsApi";

const TotalTimeCard = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    getTotalTime()
      .then((res) => setTime(res.data?.totalSeconds || 0))
      .catch(() => {});
  }, []);

  const hours = (time / 3600).toFixed(1);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <p style={{
        fontSize: 10, color: "rgba(148,163,184,0.5)",
        fontFamily: "'DM Mono',monospace", margin: "0 0 8px",
      }}>TOTAL CODING TIME</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        <h3 style={{
          fontSize: 32, fontWeight: 900, color: "#34d399", margin: 0, lineHeight: 1,
          fontFamily: "var(--font-display)", letterSpacing: "-0.02em"
        }}>{hours}</h3>
        <span style={{
          fontSize: 12, color: "rgba(52,211,153,0.5)", fontWeight: 700,
          fontFamily: "'DM Mono',monospace", marginBottom: 3
        }}>HRS</span>
      </div>
    </div>
  );
};

export default TotalTimeCard;