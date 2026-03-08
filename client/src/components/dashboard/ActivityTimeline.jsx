import { useEffect, useState, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import Loader from "../Loader";

const TYPE_CONFIG = {
  default: { color: "#a78bfa", glow: "rgba(167,139,250,0.4)", icon: "◉" },
  solved:  { color: "#34d399", glow: "rgba(52,211,153,0.4)",  icon: "◆" },
  test:    { color: "#fbbf24", glow: "rgba(251,191,36,0.4)",  icon: "▣" },
  note:    { color: "#38bdf8", glow: "rgba(56,189,248,0.4)",  icon: "▤" },
  review:  { color: "#f472b6", glow: "rgba(244,114,182,0.4)", icon: "◇" },
};

const getConfig = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("solved") || a.includes("complet")) return TYPE_CONFIG.solved;
  if (a.includes("test") || a.includes("mock"))    return TYPE_CONFIG.test;
  if (a.includes("note"))                           return TYPE_CONFIG.note;
  if (a.includes("review") || a.includes("revis")) return TYPE_CONFIG.review;
  return TYPE_CONFIG.default;
};

const ActivityTimeline = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsRef = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/dashboard/activity", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivities(res.data);
      } catch (error) {
        console.error("Failed to fetch activities", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  useEffect(() => {
    if (loading || activities.length === 0) return;
    const cards = itemsRef.current.filter(Boolean);
    gsap.fromTo(cards,
      { opacity: 0, x: -20, filter: "blur(6px)" },
      { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.5, stagger: 0.08, ease: "expo.out", delay: 0.1 }
    );
  }, [activities, loading]);

  const onHover = (e, enter) => {
    gsap.to(e.currentTarget, {
      x: enter ? 4 : 0,
      background: enter ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
      duration: 0.25, ease: "power2.out",
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily: "var(--font-display)",
        width: "100%",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 9, letterSpacing: "0.4em", color: "rgba(167,139,250,0.5)", fontFamily: "'DM Mono', monospace", margin: "0 0 6px" }}>
          ▸ RECENT_ACTIVITY
        </p>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0", margin: 0, letterSpacing: "-0.02em" }}>
          Activity Timeline
        </h3>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />

      {/* List */}
      <div style={{ maxHeight: 360, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {loading ? (
          <Loader size={20} />
        ) : activities.length > 0 ? (
          activities.map((activity, idx) => {
            const cfg = getConfig(activity.action);
            return (
              <div key={activity.id} style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
                {/* Timeline line + dot */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 20 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", background: cfg.color,
                    boxShadow: `0 0 8px ${cfg.glow}`, flexShrink: 0, marginTop: 14,
                  }} />
                  {idx < activities.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: "rgba(255,255,255,0.06)", marginTop: 4 }} />
                  )}
                </div>

                {/* Card */}
                <div
                  ref={(el) => (itemsRef.current[idx] = el)}
                  onMouseEnter={(e) => onHover(e, true)}
                  onMouseLeave={(e) => onHover(e, false)}
                  style={{
                    flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", borderRadius: 12, cursor: "default",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    marginBottom: idx < activities.length - 1 ? 4 : 0,
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: cfg.color }}>{cfg.icon}</span>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1", margin: 0 }}>
                        {activity.action}
                      </p>
                      <p style={{ fontSize: 10, color: "rgba(148,163,184,0.65)", margin: "2px 0 0", fontFamily: "'DM Mono', monospace" }}>
                        {activity.problemId?.title || "Unknown Problem"}
                      </p>
                    </div>
                  </div>
                  <p style={{
                    fontSize: 10, color: "rgba(148,163,184,0.45)",
                    fontFamily: "'DM Mono', monospace", flexShrink: 0, marginLeft: 12,
                  }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ fontSize: 11, color: "rgba(148,163,184,0.35)", letterSpacing: "0.3em", fontFamily: "'DM Mono', monospace" }}>
              NO ACTIVITY YET
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;