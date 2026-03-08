import { useEffect, useRef, useState } from "react";
import { getHeatmap } from "../../api/analyticsApi";

// Ensure GSAP is installed: npm install gsap
import { gsap } from "gsap";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getColor = (count) => {
  if (count >= 4) return { bg: "#00e5a0", glow: "0 0 10px rgba(0,229,160,0.7), 0 0 20px rgba(0,229,160,0.3)" };
  if (count === 3) return { bg: "rgba(0,229,160,0.72)", glow: "0 0 8px rgba(0,229,160,0.5)" };
  if (count === 2) return { bg: "rgba(0,229,160,0.42)", glow: "0 0 6px rgba(0,229,160,0.3)" };
  if (count === 1) return { bg: "rgba(0,229,160,0.20)", glow: "0 0 4px rgba(0,229,160,0.15)" };
  return { bg: "rgba(255,255,255,0.06)", glow: "none" };
};

const HeatmapCalendar = ({ days = 90 }) => {
  const [activityMap, setActivityMap] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const gridRef = useRef(null);
  const containerRef = useRef(null);
  const legendRef = useRef(null);

  useEffect(() => {
    getHeatmap()
      .then((res) => {
        if (Array.isArray(res.data)) {
          const map = {};
          res.data.forEach((d) => {
            if (d.date) map[d.date] = d.count || d.value || 1;
          });
          setActivityMap(map);
        }
      })
      .catch(() => {});
  }, []);

  // Build cells
  const today = new Date();
  const tempCells = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const localYear = d.getFullYear();
    const localMonth = String(d.getMonth() + 1).padStart(2, "0");
    const localDay = String(d.getDate()).padStart(2, "0");
    const key = `${localYear}-${localMonth}-${localDay}`;
    return {
      key,
      count: activityMap[key] ?? 0,
      dayOfWeek: d.getDay(),
      month: d.getMonth(),
      dayNum: d.getDate(),
      fullDate: d,
    };
  });

  // Build columns (weeks)
  const columns = [];
  let currentColumn = [];
  tempCells.forEach((cell) => {
    if (cell.dayOfWeek === 0 && currentColumn.length > 0) {
      columns.push(currentColumn);
      currentColumn = [];
    }
    if (columns.length === 0 && currentColumn.length === 0 && cell.dayOfWeek !== 0) {
      for (let i = 0; i < cell.dayOfWeek; i++) {
        currentColumn.push({ key: `pad-${i}`, count: -1, isPad: true });
      }
    }
    currentColumn.push(cell);
  });
  if (currentColumn.length > 0) columns.push(currentColumn);

  // Month labels: show month name at the first column of that month
  const monthLabels = columns.map((col) => {
    const firstReal = col.find((c) => !c.isPad);
    if (firstReal && firstReal.dayNum <= 7) {
      return MONTH_NAMES[firstReal.month];
    }
    return null;
  });

  // GSAP animations on mount
  useEffect(() => {
    const cells = gridRef.current?.querySelectorAll(".heatmap-cell");
    if (!cells?.length) return;

    // Initial state
    gsap.set(cells, { scale: 0, opacity: 0 });
    gsap.set(containerRef.current, { opacity: 0, y: 20 });
    gsap.set(legendRef.current, { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "back.out(1.4)" } });

    tl.to(containerRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
      .to(cells, {
        scale: 1,
        opacity: 1,
        duration: 0.35,
        stagger: {
          each: 0.006,
          from: "start",
          grid: "auto",
        },
      }, "-=0.2")
      .to(legendRef.current, { opacity: 1, duration: 0.4 }, "-=0.1");
  }, [activityMap]);

  const handleMouseEnter = (e, cell) => {
    if (cell.isPad || cell.count === -1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    gsap.to(e.currentTarget, {
      scale: 1.45,
      duration: 0.2,
      ease: "back.out(2)",
      zIndex: 10,
    });

    setTooltip({
      key: cell.key,
      count: cell.count,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 8,
    });
  };

  const handleMouseLeave = (e) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out",
    });
    setTooltip(null);
  };



  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl p-6"
      style={{
        background: "linear-gradient(135deg, rgba(15,20,30,0.97) 0%, rgba(10,16,26,0.99) 100%)",
        border: "1px solid rgba(0,229,160,0.12)",
        boxShadow: "0 0 0 1px rgba(0,229,160,0.04), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        fontFamily: "'DM Mono', 'Fira Code', monospace",
      }}
    >
      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div
            className="px-3 py-2 rounded-lg text-xs whitespace-nowrap"
            style={{
              background: "rgba(0,229,160,0.12)",
              border: "1px solid rgba(0,229,160,0.35)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(0,229,160,0.15)",
              color: "#e2e8f0",
            }}
          >
            <div style={{ color: "#00e5a0", fontWeight: 600, letterSpacing: "0.05em" }}>
              {tooltip.count > 0 ? `${tooltip.count} submission${tooltip.count !== 1 ? "s" : ""}` : "No submissions"}
            </div>
            <div style={{ color: "rgba(139,148,158,0.75)", fontSize: "10px", marginTop: 2 }}>
              {tooltip.key}
            </div>
            {/* Arrow */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                bottom: -5,
                width: 8,
                height: 8,
                background: "rgba(0,229,160,0.12)",
                border: "1px solid rgba(0,229,160,0.35)",
                borderTop: "none",
                borderLeft: "none",
                transform: "translateX(-50%) rotate(45deg)",
              }}
            />
          </div>
        </div>
      )}



      {/* Calendar grid */}
      <div className="flex gap-3">
        {/* Day labels */}
        <div className="flex flex-col pt-6" style={{ gap: 3 }}>
          {DAY_LABELS.map((label, i) => (
            <div
              key={label}
              style={{
                height: 14,
                width: 24,
                fontSize: 9,
                color: i % 2 === 0 ? "rgba(139,148,158,0.5)" : "transparent",
                display: "flex",
                alignItems: "center",
                letterSpacing: "0.06em",
              }}
            >
              {label.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Columns with month labels */}
        <div className="flex flex-col flex-1 overflow-x-auto" style={{ paddingBottom: 4 }}>
          {/* Month labels row */}
          <div className="flex mb-2" style={{ gap: 3 }}>
            {columns.map((_, colIdx) => (
              <div
                key={`month-${colIdx}`}
                style={{
                  width: 14,
                  fontSize: 9,
                  color: monthLabels[colIdx] ? "rgba(0,229,160,0.6)" : "transparent",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                  fontWeight: monthLabels[colIdx] ? 600 : 400,
                }}
              >
                {monthLabels[colIdx] || "·"}
              </div>
            ))}
          </div>

          {/* Cells grid */}
          <div ref={gridRef} className="flex" style={{ gap: 3 }}>
            {columns.map((col, colIdx) => (
              <div key={`col-${colIdx}`} className="flex flex-col" style={{ gap: 3 }}>
                {col.map((cell) => {
                  if (cell.isPad || cell.count === -1) {
                    return <div key={cell.key} style={{ width: 14, height: 14 }} />;
                  }
                  const { bg, glow } = getColor(cell.count);
                  return (
                    <div
                      key={cell.key}
                      className="heatmap-cell relative"
                      onMouseEnter={(e) => handleMouseEnter(e, cell)}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        background: bg,
                        boxShadow: cell.count > 0 ? glow : "none",
                        cursor: "crosshair",
                        transition: "background 0.2s ease",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div ref={legendRef} className="flex items-center justify-end gap-2 mt-5 pt-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <span style={{ fontSize: 9, color: "rgba(139,148,158,0.4)", letterSpacing: "0.08em" }}>LESS</span>
        {[0, 1, 2, 3, 4].map((v) => {
          const { bg } = getColor(v);
          return (
            <div
              key={v}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: bg,
                boxShadow: v > 0 ? `0 0 4px rgba(0,229,160,${v * 0.12})` : "none",
              }}
            />
          );
        })}
        <span style={{ fontSize: 9, color: "rgba(139,148,158,0.4)", letterSpacing: "0.08em" }}>MORE</span>
      </div>
    </div>
  );
};

export default HeatmapCalendar;