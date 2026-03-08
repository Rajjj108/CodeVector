import { useEffect, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import gsap from "gsap";

ChartJS.register(ArcElement, Tooltip, Legend);

const ProgressChart = ({ solved = 0, revision = 0, pending = 0 }) => {
  const containerRef = useRef(null);
  const total = solved + revision + pending || 1;

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(containerRef.current,
      { opacity: 0, scale: 0.92, filter: "blur(8px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.8, ease: "expo.out" }
    );
  }, []);

  const data = {
    labels: ["Solved", "Revision", "Pending"],
    datasets: [{
      data: [solved, revision, pending],
      backgroundColor: [
        "rgba(52,211,153,0.85)",
        "rgba(251,191,36,0.85)",
        "rgba(100,116,139,0.5)",
      ],
      borderColor: [
        "rgba(52,211,153,0.3)",
        "rgba(251,191,36,0.3)",
        "rgba(100,116,139,0.2)",
      ],
      borderWidth: 1,
      hoverBackgroundColor: ["#34d399", "#fbbf24", "#64748b"],
      hoverBorderColor: ["#34d399", "#fbbf24", "#64748b"],
      hoverOffset: 6,
    }],
  };

  const options = {
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(5,8,15,0.9)",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 10,
        titleColor: "#e2e8f0",
        bodyColor: "rgba(148,163,184,0.8)",
        titleFont: { family: "'DM Mono', monospace", size: 11 },
        bodyFont: { family: "'DM Mono', monospace", size: 11 },
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw} (${Math.round((ctx.raw / total) * 100)}%)`,
        },
      },
    },
    animation: { animateRotate: true, duration: 1200, easing: "easeOutQuart" },
  };

  const STATS = [
    { label: "Solved",   value: solved,   color: "#34d399", glow: "rgba(52,211,153,0.3)",  pct: Math.round((solved / total) * 100) },
    { label: "Revision", value: revision, color: "#fbbf24", glow: "rgba(251,191,36,0.3)",  pct: Math.round((revision / total) * 100) },
    { label: "Pending",  value: pending,  color: "#64748b", glow: "rgba(100,116,139,0.2)", pct: Math.round((pending / total) * 100) },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: "var(--font-display)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "24px",
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <p style={{ fontSize: 9, letterSpacing: "0.4em", color: "rgba(167,139,250,0.5)", fontFamily: "'DM Mono', monospace", margin: "0 0 6px" }}>
        ▸ PROGRESS_CHART
      </p>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", margin: "0 0 20px", letterSpacing: "-0.02em" }}>
        Problem Breakdown
      </h3>

      {/* Chart + center label */}
      <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 24px" }}>
        <Doughnut data={data} options={options} />
        {/* Center overlay */}
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", pointerEvents: "none",
        }}>
          <p style={{ fontSize: 26, fontWeight: 900, color: "#e2e8f0", margin: 0, letterSpacing: "-0.04em" }}>
            {total}
          </p>
          <p style={{ fontSize: 9, color: "rgba(148,163,184,0.5)", letterSpacing: "0.2em", fontFamily: "'DM Mono', monospace", margin: "2px 0 0" }}>
            TOTAL
          </p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {STATS.map(({ label, value, color, glow, pct }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: color,
              boxShadow: `0 0 6px ${glow}`, flexShrink: 0,
            }} />
            <span style={{ fontSize: 11, color: "rgba(148,163,184,0.7)", flex: 1, fontFamily: "'DM Mono', monospace" }}>
              {label}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color, marginRight: 6 }}>{value}</span>
            <span style={{ fontSize: 10, color: "rgba(148,163,184,0.35)", fontFamily: "'DM Mono', monospace", width: 30, textAlign: "right" }}>
              {pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressChart;