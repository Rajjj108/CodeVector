/**
 * TrackerHeader — cyber edition
 * Keeps PageHeader hamburger + search bar unchanged.
 * Replaces the green "solved" badge with a cyber purple style.
 */
import SearchBar from "./SearchBar";
import { getTopicStyle } from "./topicColors.js";
import PageHeader from "../layout/PageHeader";

const TrackerHeader = ({
  headerRef,
  solved,
  totalQuestions,
  activeTopic
}) => {
  const rightSlot = (
    <>
      {/* Search */}
      <SearchBar />

      {/* Live solved badge — cyber style */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 16px", borderRadius: 6,
        background: "rgba(124,58,237,0.1)",
        border: "1px solid rgba(124,58,237,0.3)",
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#34d399",
          boxShadow: "0 0 8px rgba(52,211,153,0.9)",
          animation: "livepulse 2s ease-in-out infinite",
        }} />
        <span style={{
          fontSize: 11, color: "rgba(167,139,250,0.8)",
          fontFamily: "'DM Mono',monospace",
          letterSpacing: "0.18em", fontWeight: 600,
        }}>
          {solved}/{totalQuestions} SOLVED
        </span>
      </div>

      {/* Active topic badge */}
      {activeTopic !== "All" && (
        <div style={{
          padding: "6px 12px", borderRadius: 4,
          fontSize: 9, fontWeight: 700, letterSpacing: "0.14em",
          fontFamily: "'DM Mono',monospace",
          background: `${getTopicStyle(activeTopic).color}14`,
          color: getTopicStyle(activeTopic).color,
          border: `1px solid ${getTopicStyle(activeTopic).color}30`,
        }}>
          {activeTopic.toUpperCase()}
        </div>
      )}
    </>
  );

  return (
    <div ref={headerRef}>
      <PageHeader
        label="▸ DSA_TRACKER"
        title="DSA Tracker"
        gradient="linear-gradient(120deg,#f1f5f9 15%,#a78bfa 55%,#7c3aed 100%)"
        rightSlot={rightSlot}
      />
    </div>
  );
};

export default TrackerHeader;