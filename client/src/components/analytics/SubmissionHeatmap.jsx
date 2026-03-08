import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";

const SubmissionHeatmap = ({ submissions = [] }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current,
      { opacity: 0, y: 16, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }
    );
  }, []);

  const total = submissions.reduce((sum, s) => sum + (s.count || 0), 0);

  return (
    <div
      ref={ref}
      style={{
        fontFamily: "var(--font-display)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: "22px 24px",
        backdropFilter: "blur(16px)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: "0.4em", color: "rgba(167,139,250,0.5)", fontFamily: "'DM Mono', monospace", margin: "0 0 5px" }}>
            ▸ SUBMISSION_MAP
          </p>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", margin: 0, letterSpacing: "-0.02em" }}>
            Submission Activity
          </h3>
        </div>
        <div style={{
          textAlign: "right",
          background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.2)",
          borderRadius: 10, padding: "8px 14px",
        }}>
          <p style={{ fontSize: 18, fontWeight: 900, color: "#a78bfa", margin: "0 0 1px", letterSpacing: "-0.03em" }}>{total}</p>
          <p style={{ fontSize: 9, color: "rgba(167,139,250,0.5)", letterSpacing: "0.15em", fontFamily: "'DM Mono', monospace", margin: 0 }}>
            TOTAL
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />

      {/* Heatmap with overrides */}
      <div style={{ overflowX: "auto" }}>
        <style>{`
          .heatmap-wrapper .react-calendar-heatmap text {
            font-family: 'DM Mono', monospace;
            font-size: 7px;
            fill: rgba(148,163,184,0.35);
          }
          .heatmap-wrapper .react-calendar-heatmap rect {
            rx: 2;
          }
          .heatmap-wrapper .color-empty {
            fill: rgba(255,255,255,0.05);
          }
          .heatmap-wrapper .color-scale-1 { fill: rgba(167,139,250,0.25); }
          .heatmap-wrapper .color-scale-2 { fill: rgba(167,139,250,0.45); }
          .heatmap-wrapper .color-scale-3 { fill: rgba(167,139,250,0.65); }
          .heatmap-wrapper .color-scale-4 { fill: rgba(167,139,250,0.9);  }
          .heatmap-wrapper .react-calendar-heatmap-all-weeks {
            transform: translateY(4px);
          }
        `}</style>
        <div className="heatmap-wrapper">
          <CalendarHeatmap
            startDate={new Date("2026-01-01")}
            endDate={new Date()}
            values={submissions}
            classForValue={(value) => {
              if (!value || value.count === 0) return "color-empty";
              if (value.count >= 4) return "color-scale-4";
              return `color-scale-${value.count}`;
            }}
            showWeekdayLabels
          />
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, justifyContent: "flex-end" }}>
        <span style={{ fontSize: 9, color: "rgba(148,163,184,0.35)", fontFamily: "'DM Mono', monospace" }}>LESS</span>
        {["rgba(255,255,255,0.05)", "rgba(167,139,250,0.25)", "rgba(167,139,250,0.45)", "rgba(167,139,250,0.65)", "rgba(167,139,250,0.9)"].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 9, color: "rgba(148,163,184,0.35)", fontFamily: "'DM Mono', monospace" }}>MORE</span>
      </div>
    </div>
  );
};

export default SubmissionHeatmap;