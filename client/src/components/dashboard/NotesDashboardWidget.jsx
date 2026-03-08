/**
 * NotesDashboardWidget.jsx
 * Live preview of recent notes on the Dashboard.
 * Reads from localStorage (same key as Notes.jsx) — no API needed.
 * Clicking the card or "Open Notes" navigates to /notes.
 */
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

const STORAGE_KEY = "dsa_notes_v2";
const ACCENT_COLORS = {
  purple: "#a78bfa", cyan: "#22d3ee", green: "#34d399",
  pink: "#f472b6",   orange: "#fb923c", yellow: "#fbbf24",
};

const loadNotes = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};

const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const NotesDashboardWidget = () => {
  const navigate = useNavigate();
  const notes    = useMemo(() => loadNotes(), []);
  const pinned   = notes.filter(n => n.pinned).slice(0, 1);
  const recent   = notes
    .filter(n => !n.pinned)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 4);
  const preview  = [...pinned, ...recent].slice(0, 4);

  const allTags  = [...new Set(notes.flatMap(n => n.tags))].slice(0, 6);

  return (
    <div style={{ padding: "20px 22px", minHeight: 220, fontFamily: "var(--font-display)" }}>

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#38bdf8" }}>▤</span>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(56,189,248,0.8)", fontFamily: "'DM Mono',monospace" }}>
            {notes.length} NOTE{notes.length !== 1 ? "S" : ""}
          </span>
          {notes.filter(n => n.pinned).length > 0 && (
            <span style={{ fontSize: 9, color: "rgba(251,191,36,0.6)", fontFamily: "'DM Mono',monospace" }}>
              · {notes.filter(n => n.pinned).length} PINNED
            </span>
          )}
        </div>
        <button
          onClick={() => navigate("/notes")}
          style={{
            background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.25)",
            borderRadius: 8, padding: "4px 12px", cursor: "pointer",
            fontSize: 10, color: "#38bdf8", fontFamily: "'DM Mono',monospace",
            letterSpacing: "0.1em", transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(56,189,248,0.2)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(56,189,248,0.1)"}
        >
          OPEN NOTES →
        </button>
      </div>

      {/* Note cards */}
      {preview.length === 0 ? (
        <div
          onClick={() => navigate("/notes")}
          style={{ textAlign: "center", padding: "28px 0", cursor: "pointer" }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>📝</div>
          <p style={{ fontSize: 11, color: "rgba(148,163,184,0.4)", letterSpacing: "0.2em", fontFamily: "'DM Mono',monospace", margin: 0 }}>
            NO NOTES YET — CLICK TO START
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {preview.map(note => {
            const hex = ACCENT_COLORS[note.color] || "#a78bfa";
            return (
              <div
                key={note.id}
                onClick={() => navigate("/notes")}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "9px 12px", borderRadius: 10, cursor: "pointer",
                  background: `${hex}08`, border: `1px solid ${hex}20`,
                  transition: "background 0.2s",
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${hex}14`}
                onMouseLeave={e => e.currentTarget.style.background = `${hex}08`}
              >
                {/* Left color accent */}
                <div style={{ width: 3, borderRadius: 2, alignSelf: "stretch", background: hex, opacity: 0.7, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {note.pinned && <span style={{ fontSize: 9 }}>📌</span>}
                    <p style={{
                      margin: 0, fontSize: 12, fontWeight: 700, color: "#f1f5f9",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {note.title || <span style={{ opacity: 0.4 }}>Untitled</span>}
                    </p>
                  </div>
                  <p style={{
                    margin: "2px 0 0", fontSize: 10, color: "rgba(148,163,184,0.5)", lineHeight: 1.4,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {note.body || "Empty note"}
                  </p>
                </div>
                <span style={{ fontSize: 9, color: "rgba(148,163,184,0.3)", fontFamily: "'DM Mono',monospace", flexShrink: 0, paddingTop: 2 }}>
                  {timeAgo(note.updatedAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tags cloud */}
      {allTags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 12 }}>
          {allTags.map(tag => (
            <span key={tag} onClick={() => navigate("/notes")} style={{
              fontSize: 9, color: "rgba(56,189,248,0.55)", fontFamily: "'DM Mono',monospace",
              background: "rgba(56,189,248,0.07)", border: "1px solid rgba(56,189,248,0.15)",
              borderRadius: 20, padding: "2px 8px", cursor: "pointer",
            }}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesDashboardWidget;
