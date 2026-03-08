/**
 * TopicSidebar — cyber edition
 * Renders as a horizontal pill-based topic filter bar (matching screenshot 2)
 * instead of a side panel, so it sits above the problem table.
 * All props and logic unchanged.
 */
import { getTopicStyle } from "./topicColors.js";
import Loader from "../Loader";

const TopicSidebar = ({
  allTopics,
  activeTopic,
  setActiveTopic,
  topicStats,
  topicTotals,
  topicsLoading,
}) => {
  return (
    <div style={{
      background: "rgba(10,20,18,0.9)",
      border: "1px solid rgba(0,229,160,0.2)",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      position: "sticky",
      top: 80,
    }}>
      {/* Header */}
      <div style={{
        padding: "11px 16px 10px",
        borderBottom: "1px solid rgba(0,229,160,0.15)",
        background: "rgba(0,229,160,0.04)",
      }}>
        <p style={{
          fontSize: 9, letterSpacing: "0.4em", color: "rgba(0,229,160,0.6)",
          fontFamily: "'DM Mono',monospace", margin: 0, fontWeight: 700,
        }}>▸ TOPICS</p>
      </div>

      <div style={{
        padding: "6px 5px",
        maxHeight: "calc(100vh - 220px)",
        overflowY: "auto",
      }}>
        {topicsLoading ? (
          <div style={{ padding: "20px 0", display: "flex", justifyContent: "center" }}>
            <Loader size={14} label="" />
          </div>
        ) : (
          allTopics.map((topic) => {
            const isActive   = activeTopic === topic;
            const tc         = topic === "All"
              ? { color: "#a78bfa", glow: "rgba(167,139,250,0.3)" }
              : getTopicStyle(topic);
            const stats      = topicStats[topic];
            const topicTotal = topicTotals[topic] || 0;
            const pct        = stats && stats.loaded > 0
              ? Math.round((stats.solved / stats.loaded) * 100)
              : 0;

            return (
              <button
                key={topic}
                onClick={() => setActiveTopic(topic)}
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  padding: "8px 11px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: isActive ? `${tc.color}14` : "transparent",
                  border: `1px solid ${isActive ? `${tc.color}35` : "transparent"}`,
                  marginBottom: 2,
                  textAlign: "left",
                  transition: "all 0.18s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = "transparent")}
              >
                {/* Active left bar */}
                {isActive && (
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
                    background: tc.color,
                    boxShadow: `0 0 8px ${tc.color}`,
                  }} />
                )}

                {/* Topic name + count */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    fontSize: 10.5,
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? tc.color : "rgba(203,213,225,0.55)",
                    fontFamily: "'DM Mono',monospace",
                    letterSpacing: "0.04em",
                    transition: "color 0.18s",
                  }}>
                    {topic}
                  </span>
                  {topicTotal > 0 && (
                    <span style={{
                      fontSize: 9,
                      color: isActive ? `${tc.color}80` : "rgba(148,163,184,0.28)",
                      fontFamily: "'DM Mono',monospace",
                    }}>
                      {topicTotal}
                    </span>
                  )}
                </div>

                {/* Mini progress bar */}
                {stats && stats.loaded > 0 && (
                  <div style={{ height: 1.5, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: tc.color,
                      boxShadow: `0 0 4px ${tc.glow}`,
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TopicSidebar;