/**
 * Notes.jsx — Redesigned to match Orbitron notebook UI
 *
 * LEFT SIDEBAR:   NOTEBOOKS section + SUBMISSIONS (locked, backend) + user notes
 * RIGHT PANEL:    Submission detail view — status/runtime/memory/submitted cards,
 *                 code block, whiteboard snapshot, Edit Notes / Share Concept CTAs
 *                 OR Note editor for user-created notes
 *
 * FIX: SubmissionDetail scroll now works — wrapper div is a flex column,
 *      so the child's flex:1 + minHeight:0 + overflowY:auto are honoured.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import gsap from "gsap";
import { Excalidraw } from "@excalidraw/excalidraw";
import PageHeader from "../components/layout/PageHeader";
import AIReviewPanel from "../components/AIReviewPanel";

/* ── Constants ── */
const STORAGE_KEY = "dsa_notes_v2";
const API = "http://localhost:5000";
const SOLUTIONS_ID = "__solutions_log__";

const DIFF_COLOR = { Easy: "#34d399", Medium: "#fbbf24", Hard: "#f87171" };
const LANG_COLOR  = { javascript: "#f0db4f", python: "#4B8BBE", java: "#f89820", cpp: "#00599C" };
const LANG_LABEL  = { javascript: "JAVASCRIPT SOLUTION", python: "PYTHON SOLUTION", java: "JAVA SOLUTION", cpp: "C++ SOLUTION" };

const ACCENT = [
  { id: "purple", hex: "#a78bfa", bg: "rgba(167,139,250,0.12)", border: "rgba(167,139,250,0.28)" },
  { id: "cyan",   hex: "#22d3ee", bg: "rgba(34,211,238,0.12)",  border: "rgba(34,211,238,0.28)"  },
  { id: "green",  hex: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.28)"  },
  { id: "pink",   hex: "#f472b6", bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.28)" },
  { id: "orange", hex: "#fb923c", bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.28)"  },
  { id: "yellow", hex: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.28)"  },
];

const loadNotes = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};
const saveNotes = n => localStorage.setItem(STORAGE_KEY, JSON.stringify(n));
const newNote   = () => ({ id: Date.now(), title: "", body: "", tags: [], color: "purple", pinned: false, createdAt: Date.now(), updatedAt: Date.now() });
const fmtDate   = ts => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const timeAgo   = ts => {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
const renderMd = t =>
  t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
   .replace(/`([^`]+)`/g,"<code>$1</code>")
   .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
   .replace(/\*(.+?)\*/g,"<em>$1</em>")
   .replace(/^#{3}\s(.+)$/gm,"<h3>$1</h3>")
   .replace(/^#{2}\s(.+)$/gm,"<h2>$1</h2>")
   .replace(/^#\s(.+)$/gm,"<h1>$1</h1>")
   .replace(/^-\s(.+)$/gm,"<li>$1</li>")
   .replace(/\n/g,"<br/>");

/* ── Colours ── */
const C = {
  bg:         "#080f0d",
  sidebar:    "rgba(8,16,14,0.98)",
  panel:      "rgba(9,17,15,0.96)",
  border:     "rgba(0,229,160,0.18)",
  text:       "#e6edf3",
  muted:      "rgba(230,237,243,0.55)",
  teal:       "#00b87a",
  tealL:      "#00e5a0",
  active:     "rgba(0,229,160,0.14)",
  cardbg:     "rgba(9, 11, 12, 0.82)",
  cardborder: "rgba(117, 130, 145, 0.9)",
};

/* ══════════════════════════════════════════════════════
   SUBMISSION DETAIL PANEL
══════════════════════════════════════════════════════ */
const SubmissionDetail = ({ submission: s }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(s.code || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const langKey   = (s.language || "").toLowerCase();
  const langLabel = LANG_LABEL[langKey] || `${(s.language || "").toUpperCase()} SOLUTION`;

  const STATS = [
    { label: "STATUS",    value: s.status || "Accepted", icon: (s.status === "Accepted" || !s.status) ? "✓" : "✕", color: "#34d399" },
    { label: "RUNTIME",   value: s.runtime  || "— ms", icon: null, color: C.text  },
    { label: "MEMORY",    value: s.memory   || "—",    icon: null, color: C.text  },
    { label: "SUBMITTED", value: fmtDate(s.solvedAt || Date.now()), icon: null, color: C.muted },
  ];

  return (
    /* ─────────────────────────────────────────────────────────────────
       KEY FIX:
       • flex: 1          → fills the flex-column wrapper completely
       • minHeight: 0     → overrides the default min-height:auto so the
                            browser actually clips this element
       • overflowY: auto  → enables the scrollbar once content overflows
    ───────────────────────────────────────────────────────────────── */
    <div style={{
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      overflowX: "hidden",
      display: "flex",
      flexDirection: "column",
      padding: "28px 32px 48px",
      gap: 24,
    }}>

      {/* ── Latest Activity label + Title ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 24, height: 1.5, background: C.muted }} />
          <span style={{ fontSize: 9, letterSpacing: "0.35em", color: C.muted, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
            LATEST ACTIVITY
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.text, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
          {s.title ? (
            <>
              <span style={{ color: C.text }}>Submission — </span>
              <span style={{ color: C.tealL }}>{s.title}</span>
            </>
          ) : "Latest Submission"}
        </h2>
      </div>

      {/* ── Stats cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {STATS.map(({ label, value, icon, color }) => (
          <div key={label} style={{
            background: C.cardbg,
            border: `1px solid ${C.cardborder}`,
            borderRadius: 14,
            padding: "14px 16px",
            backdropFilter: "blur(12px)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: "8%", right: "8%", height: 1,
              background: "linear-gradient(90deg,transparent,rgba(0,229,160,0.15),transparent)",
              pointerEvents: "none",
            }} />
            <p style={{ margin: "0 0 6px", fontSize: 8, letterSpacing: "0.3em", color: C.muted, fontFamily: "'DM Mono',monospace" }}>{label}</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color, display: "flex", alignItems: "center", gap: 6 }}>
              {icon && (
                <span style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.4)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "#34d399",
                }}>{icon}</span>
              )}
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Code block ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: C.tealL }}>&lt;&gt;</span>
            <span style={{ fontSize: 9, letterSpacing: "0.3em", color: C.muted, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
              {langLabel}
            </span>
          </div>
          <button onClick={copy} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
            color: copied ? "#34d399" : C.muted, fontSize: 11, fontFamily: "'DM Mono',monospace",
          }}>
            <span>📋</span>{copied ? "Copied!" : "Copy Code"}
          </button>
        </div>

        <div style={{
          background: "rgba(8,4,20,0.95)",
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
          borderLeft: `3px solid ${LANG_COLOR[langKey] || C.tealL}`,
        }}>
          <pre style={{
            margin: 0, padding: "20px 22px",
            fontSize: 12.5, lineHeight: 1.75,
            fontFamily: "'DM Mono',monospace", color: "#94a3b8",
            overflowX: "auto", maxHeight: 320, overflowY: "auto",
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {s.code || "// No code saved"}
          </pre>
        </div>
      </div>

      {/* ── Whiteboard snapshot ── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: C.tealL }}>✎</span>
          <span style={{ fontSize: 9, letterSpacing: "0.3em", color: C.muted, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
            NOTES SNAPSHOT
          </span>
        </div>
        <div style={{
          background: C.cardbg, border: `1px solid ${C.cardborder}`,
          borderRadius: 14, overflow: "hidden", position: "relative",
          backdropFilter: "blur(12px)", height: 350,
        }}>
          {s.whiteboardData?.elements?.length > 0 ? (
            <div style={{ pointerEvents: "none", width: "100%", height: "100%" }}>
              <Excalidraw
                initialData={s.whiteboardData}
                viewModeEnabled={true}
                zenModeEnabled={true}
                gridModeEnabled={false}
                UIOptions={{ canvasActions: { loadScene: false, export: false, saveAsImage: false } }}
              />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
              <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>📝</div>
              <p style={{ fontSize: 10, color: C.muted, fontFamily: "'DM Mono',monospace", margin: 0, letterSpacing: "0.2em" }}>
                NO WHITEBOARD NOTES ATTACHED
              </p>
            </div>
          )}
        </div>
        {s.topic && (
          <p style={{ fontSize: 11, color: C.tealL, margin: "10px 0 0 4px", fontWeight: 700 }}>Topic: {s.topic}</p>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div style={{ display: "flex", gap: 12 }}>
        <button style={{
          background: "linear-gradient(120deg,#7c3aed,#a855f7)",
          border: "none", borderRadius: 10, padding: "10px 24px",
          color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 0 20px rgba(124,58,237,0.4)",
        }}>Edit Notes</button>
        <button style={{
          background: "transparent", border: `1px solid ${C.cardborder}`,
          borderRadius: 10, padding: "10px 24px",
          color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>Share Concept</button>
      </div>

      {/* ── AI Review Panel ── */}
      <div className="ai-review-panel">
        <AIReviewPanel key={s.id} problemId={s.problemId} submissionId={s.id} />
      </div>

    </div>
  );
};

/* ══════════════════════════════════════════════════════
   NOTE EDITOR  (user-created notes)
══════════════════════════════════════════════════════ */
const NoteEditor = ({ note, onUpdate, onDelete }) => {
  const [preview, setPreview]   = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [delConf, setDelConf]   = useState(false);
  const col = ACCENT.find(c => c.id === note.color) || ACCENT[0];

  const addTag = () => {
    const raw = tagInput.trim().replace(/\s+/g, "-").toLowerCase();
    if (!raw || note.tags.includes(raw)) { setTagInput(""); return; }
    onUpdate({ tags: [...note.tags, raw] });
    setTagInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 20px", borderBottom: `1px solid ${col.border}`,
        background: col.bg, flexWrap: "wrap", flexShrink: 0,
      }}>
        {ACCENT.map(c => (
          <div key={c.id} onClick={() => onUpdate({ color: c.id })} style={{
            width: 16, height: 16, borderRadius: "50%", background: c.hex, cursor: "pointer",
            boxShadow: note.color === c.id ? `0 0 0 2px #fff, 0 0 8px ${c.hex}` : "none",
          }} />
        ))}
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
        <button onClick={() => onUpdate({ pinned: !note.pinned })} style={{
          background: note.pinned ? "rgba(251,191,36,0.18)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${note.pinned ? "rgba(251,191,36,0.4)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 6, padding: "3px 9px", cursor: "pointer",
          fontSize: 10, color: note.pinned ? "#fbbf24" : C.muted, fontFamily: "'DM Mono',monospace",
        }}>
          {note.pinned ? "📌 Pinned" : "Pin"}
        </button>
        <button onClick={() => setPreview(p => !p)} style={{
          background: preview ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${preview ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 6, padding: "3px 9px", cursor: "pointer",
          fontSize: 10, color: preview ? "#22d3ee" : C.muted, fontFamily: "'DM Mono',monospace",
        }}>
          {preview ? "✎ Edit" : "◎ Preview"}
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 7 }}>
          {delConf ? (
            <>
              <button onClick={onDelete} style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontSize: 10, color: "#f87171", fontFamily: "'DM Mono',monospace" }}>Confirm Delete</button>
              <button onClick={() => setDelConf(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontSize: 10, color: C.muted, fontFamily: "'DM Mono',monospace" }}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setDelConf(true)} style={{ background: "rgba(248,113,113,0.18)", border: "1px solid rgba(248,113,113,0.5)", borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontSize: 10, color: "rgba(248,113,113,0.9)", fontFamily: "'DM Mono',monospace" }}>✕ Delete</button>
          )}
        </div>
      </div>

      {/* Title */}
      <input
        value={note.title}
        onChange={e => onUpdate({ title: e.target.value })}
        placeholder="Note title…"
        style={{
          flexShrink: 0, background: "transparent", border: "none", outline: "none",
          padding: "16px 20px 6px", fontSize: 20, fontWeight: 800,
          color: col.hex, fontFamily: "var(--font-display)", width: "100%", boxSizing: "border-box",
        }}
      />

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "0 20px 8px", alignItems: "center", flexShrink: 0 }}>
        {note.tags.map(t => (
          <span key={t} style={{
            display: "inline-flex", alignItems: "center", gap: 3,
            padding: "2px 7px", borderRadius: 20, fontSize: 9,
            fontFamily: "'DM Mono',monospace", background: `${col.hex}18`,
            color: col.hex, border: `1px solid ${col.hex}30`,
          }}>
            #{t}
            <span onClick={() => onUpdate({ tags: note.tags.filter(x => x !== t) })} style={{ cursor: "pointer", opacity: 0.6 }}>×</span>
          </span>
        ))}
        <input
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
          placeholder="+ tag"
          style={{ background: "transparent", border: "none", outline: "none", color: C.muted, fontSize: 10, fontFamily: "'DM Mono',monospace", width: 60 }}
        />
      </div>

      <div style={{ width: "90%", height: 1, margin: "0 20px", background: `linear-gradient(90deg,transparent,${col.hex}40,transparent)`, flexShrink: 0 }} />

      {/* Body — flex:1 + minHeight:0 makes it scroll properly */}
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden", padding: "10px 20px" }}>
        {preview ? (
          <div
            className="md-preview"
            dangerouslySetInnerHTML={{ __html: renderMd(note.body) }}
            style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.8, fontFamily: "'Plus Jakarta Sans', sans-serif", height: "100%", overflowY: "auto" }}
          />
        ) : (
          <textarea
            value={note.body}
            onChange={e => onUpdate({ body: e.target.value })}
            placeholder={"Write here…\n\n**bold** *italic* `code`\n# Heading\n- list item"}
            style={{
              width: "100%", height: "100%",
              background: "transparent", border: "none", outline: "none",
              resize: "none", color: "#cbd5e1", fontSize: 12, lineHeight: 1.8,
              fontFamily: "'DM Mono',monospace", boxSizing: "border-box",
            }}
          />
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "6px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 8, color: "rgba(148,163,184,0.28)", fontFamily: "'DM Mono',monospace" }}>
          {note.body.length} chars · {note.body.split(/\s+/).filter(Boolean).length} words
        </span>
        <span style={{ fontSize: 8, color: "rgba(148,163,184,0.28)", fontFamily: "'DM Mono',monospace" }}>
          {timeAgo(note.updatedAt)}
        </span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════ */
const Notes = () => {
  const [notes,      setNotes]      = useState(loadNotes);
  const [solutions,  setSolutions]  = useState([]);
  const [loadingSol, setLoadingSol] = useState(true);
  const [active,     setActive]     = useState(SOLUTIONS_ID);
  const [activeSol,  setActiveSol]  = useState(null);
  const [search,     setSearch]     = useState("");
  const panelRef = useRef(null);
  const sideRef  = useRef(null);

  /* Fetch solutions from backend */
  useEffect(() => {
    axios.get(`${API}/api/submissions/solutions`, { withCredentials: true })
      .then(r => {
        const sols = r.data.solutions || [];
        setSolutions(sols);
        if (sols.length > 0) setActiveSol(0);
      })
      .catch(() => {})
      .finally(() => setLoadingSol(false));
  }, []);

  useEffect(() => { saveNotes(notes); }, [notes]);

  /* Entrance animations */
  useEffect(() => {
    if (sideRef.current)  gsap.fromTo(sideRef.current,  { opacity: 0, x: -18 }, { opacity: 1, x: 0,  duration: 0.5, ease: "expo.out" });
    if (panelRef.current) gsap.fromTo(panelRef.current, { opacity: 0 },          { opacity: 1,        duration: 0.6, ease: "expo.out", delay: 0.1 });
  }, []);

  useEffect(() => {
    if (panelRef.current) gsap.fromTo(panelRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.32, ease: "expo.out" });
  }, [active, activeSol]);

  const updateNote = useCallback((id, patch) =>
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n)), []);

  const createNote = () => {
    const n = newNote();
    setNotes(prev => [n, ...prev]);
    setActive(n.id);
  };
  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    setActive(SOLUTIONS_ID);
  };

  const filtered = notes
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updatedAt - a.updatedAt);

  const activeNote  = active !== SOLUTIONS_ID ? notes.find(n => n.id === active) : null;
  const onSolutions = active === SOLUTIONS_ID;
  const currentSol  = solutions[activeSol ?? 0] || null;

  /* Storage: rough byte estimate */
  const storageUsed   = new Blob([localStorage.getItem(STORAGE_KEY) || ""]).size;
  const storageLimitB = 20 * 1024 * 1024;
  const storagePct    = Math.min((storageUsed / storageLimitB) * 100, 100);
  const storageLabel  = storageUsed < 1024
    ? `${storageUsed} B`
    : storageUsed < 1048576
      ? `${(storageUsed / 1024).toFixed(1)} KB`
      : `${(storageUsed / 1048576).toFixed(2)} MB`;

  return (
    <div style={{ minHeight: "100vh", fontFamily: "var(--font-display)", background: "transparent", position: "relative" }}>
      <div>
        <PageHeader
          label="▸ NOTEBOOKS"
          title="Notes"
          gradient="linear-gradient(120deg,#e6edf3 20%,#00e5a0 100%)"
          style={{ height: 72 }}
        />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&display=swap');

        @keyframes spin { to { transform: rotate(360deg); } }
        .nb-item:hover { background: rgba(124,58,237,0.08) !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.25); border-radius: 2px; }

        /* ── AI Review Panel — override all text to Plus Jakarta Sans ── */
        .ai-review-panel,
        .ai-review-panel * {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }
        .ai-review-panel p,
        .ai-review-panel li,
        .ai-review-panel span:not([class*="label"]):not([class*="badge"]) {
          font-size: 13.5px !important;
          line-height: 1.85 !important;
          color: #cdd9e5 !important;
          font-weight: 400 !important;
          letter-spacing: 0.01em !important;
        }
        .ai-review-panel h1,
        .ai-review-panel h2,
        .ai-review-panel h3 {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
          color: #e6edf3 !important;
          line-height: 1.35 !important;
        }
        .ai-review-panel h1 { font-size: 18px !important; }
        .ai-review-panel h2 { font-size: 15px !important; }
        .ai-review-panel h3 { font-size: 13px !important; }
        .ai-review-panel strong,
        .ai-review-panel b {
          font-weight: 600 !important;
          color: #e6edf3 !important;
        }
        .ai-review-panel em,
        .ai-review-panel i {
          font-style: italic !important;
          color: #a8b8cc !important;
        }
        /* Keep code blocks monospace */
        .ai-review-panel code,
        .ai-review-panel pre,
        .ai-review-panel pre * {
          font-family: 'DM Mono', monospace !important;
          font-size: 12px !important;
          line-height: 1.7 !important;
        }

        /* ── Markdown preview body (note editor) ── */
        .md-preview,
        .md-preview p,
        .md-preview li {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          font-size: 13.5px !important;
          line-height: 1.85 !important;
          letter-spacing: 0.01em !important;
        }
        .md-preview code {
          font-family: 'DM Mono', monospace !important;
          font-size: 12px !important;
          background: rgba(0,229,160,0.07);
          border-radius: 4px;
          padding: 1px 5px;
        }
        .md-preview h1, .md-preview h2, .md-preview h3 {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          font-weight: 700 !important;
          letter-spacing: -0.02em !important;
          color: #e6edf3 !important;
        }
      `}</style>

      {/* ── Outer constrained wrapper ── */}
      <div style={{ maxWidth: "90%", margin: "0 auto", padding: "20px 0 32px" }}>
        <div style={{
          display: "flex",
          height: "calc(100vh - 130px)",
          overflow: "hidden",
          borderRadius: 14,
          border: `1px solid ${C.cardborder}`,
          backdropFilter: "blur(12px)",
          background: "rgba(9, 11, 12, 0.82)",
          boxShadow: "0 0 40px rgba(0,0,0,0.4)",
        }}>

          {/* ══════════════════════════════════════
              LEFT SIDEBAR
          ══════════════════════════════════════ */}
          <div ref={sideRef} style={{
            width: 210,
            flexShrink: 0,
            background: C.sidebar,
            borderRight: `1px solid ${C.border}`,
            borderRadius: "14px 0 0 14px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* NOTEBOOKS header */}
            <div style={{ padding: "20px 16px 12px", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 8, letterSpacing: "0.4em", color: "rgba(167,139,250,0.5)", fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                NOTEBOOKS
              </p>
            </div>

            {/* SUBMISSIONS tab */}
            <div
              className="nb-item"
              onClick={() => setActive(SOLUTIONS_ID)}
              style={{
                margin: "0 10px 4px", borderRadius: 10, padding: "10px 12px", cursor: "pointer",
                background: onSolutions ? C.active : "transparent",
                border: `1px solid ${onSolutions ? "rgba(0,229,160,0.35)" : "transparent"}`,
                transition: "all 0.18s", flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>📋</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: onSolutions ? C.tealL : "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    SUBMISSIONS
                  </p>
                  {onSolutions && (
                    <p style={{ margin: "2px 0 0", fontSize: 7.5, letterSpacing: "0.22em", color: "#34d399", fontFamily: "'DM Mono',monospace" }}>
                      ACTIVE NOW
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ padding: "10px 16px 6px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, height: 1, background: C.border }} />
                <span style={{ fontSize: 7.5, letterSpacing: "0.3em", color: "rgba(167,139,250,0.35)", fontFamily: "'DM Mono',monospace" }}>NOTES</span>
                <div style={{ flex: 1, height: 1, background: C.border }} />
              </div>
            </div>

            {/* User notes list */}
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "2px 10px" }}>
              {filtered.map(note => {
                const col   = ACCENT.find(c => c.id === note.color) || ACCENT[0];
                const isAct = active === note.id;
                return (
                  <div
                    key={note.id}
                    className="nb-item"
                    onClick={() => setActive(note.id)}
                    style={{
                      borderRadius: 10, padding: "9px 12px", cursor: "pointer", marginBottom: 3,
                      background: isAct ? `${col.hex}15` : "transparent",
                      border: `1px solid ${isAct ? `${col.hex}40` : "transparent"}`,
                      transition: "all 0.18s", position: "relative",
                    }}
                  >
                    {note.pinned && <span style={{ position: "absolute", top: 6, right: 8, fontSize: 9 }}>📌</span>}
                    <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 2, borderRadius: "0 2px 2px 0", background: col.hex, opacity: 0.7 }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12 }}>📄</span>
                      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: isAct ? col.hex : "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 14 }}>
                        {note.title || <span style={{ opacity: 0.4 }}>Untitled</span>}
                      </p>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && !loadingSol && (
                <div style={{ textAlign: "center", padding: "24px 8px", opacity: 0.35 }}>
                  <p style={{ fontSize: 9, color: C.muted, fontFamily: "'DM Mono',monospace", letterSpacing: "0.2em" }}>NO NOTES YET</p>
                </div>
              )}
            </div>

            {/* Search + New Note */}
            <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search notes…"
                style={{
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                  borderRadius: 8, color: C.text, fontFamily: "'DM Mono',monospace",
                  outline: "none", padding: "6px 10px", fontSize: 10,
                  width: "100%", boxSizing: "border-box", marginBottom: 6,
                }}
              />
              <button
                onClick={createNote}
                style={{
                  width: "100%", background: "rgba(124,58,237,0.25)",
                  border: "1px solid rgba(124,58,237,0.55)", borderRadius: 9,
                  color: "#c4b5fd", fontSize: 11, fontWeight: 700,
                  padding: "8px 0", cursor: "pointer",
                  fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em", transition: "all 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.4)"; e.currentTarget.style.color = "#e9d5ff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,0.25)"; e.currentTarget.style.color = "#c4b5fd"; }}
              >
                + NEW NOTE
              </button>
            </div>

            {/* Storage Usage */}
            <div style={{
              margin: "8px 10px 10px", flexShrink: 0,
              background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "10px 12px",
            }}>
              <p style={{ margin: "0 0 6px", fontSize: 8.5, fontWeight: 700, color: "rgba(148,163,184,0.55)", fontFamily: "'DM Mono',monospace", letterSpacing: "0.08em" }}>
                Storage Usage
              </p>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden", marginBottom: 5 }}>
                <div style={{ height: "100%", width: `${storagePct}%`, background: "linear-gradient(90deg,#7c3aed,#a78bfa)", borderRadius: 999 }} />
              </div>
              <p style={{ margin: 0, fontSize: 8, color: "rgba(148,163,184,0.35)", fontFamily: "'DM Mono',monospace" }}>
                {storageLabel} of 20MB used
              </p>
            </div>
          </div>

          {/* ══════════════════════════════════════
              RIGHT PANEL
          ══════════════════════════════════════ */}
          <div ref={panelRef} style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,              /* ← lets children shrink below natural height */
            background: C.panel,
            borderRadius: "0 14px 14px 0",
            display: "flex",
            flexDirection: "column",   /* ← children stack vertically and can flex */
            overflow: "hidden",
          }}>

            {/* ── SOLUTIONS VIEW ── */}
            {onSolutions ? (
              <>
                {/* Tab bar — fixed height, never scrolls */}
                {solutions.length > 1 && (
                  <div style={{
                    flexShrink: 0,
                    display: "flex", gap: 6, padding: "10px 20px",
                    borderBottom: `1px solid ${C.border}`,
                    overflowX: "auto", background: "rgba(0,0,0,0.18)",
                  }}>
                    {solutions.map((s, i) => (
                      <button key={s.problemId || i} onClick={() => setActiveSol(i)} style={{
                        flexShrink: 0, padding: "5px 14px", borderRadius: 8,
                        background: activeSol === i ? C.active : "transparent",
                        border: `1px solid ${activeSol === i ? "rgba(0,229,160,0.35)" : "rgba(255,255,255,0.08)"}`,
                        color: activeSol === i ? C.tealL : C.muted,
                        fontSize: 10, fontFamily: "'DM Mono',monospace", cursor: "pointer", whiteSpace: "nowrap",
                      }}>
                        #{i + 1} {s.title || "Submission"}
                      </button>
                    ))}
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────
                    THE SCROLL FIX:
                    This wrapper is a flex column so SubmissionDetail's
                    flex:1 + minHeight:0 + overflowY:auto take effect.
                    Without display:flex here the child expands freely
                    and never hits its scroll threshold.
                ───────────────────────────────────────────────────── */}
                <div style={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}>
                  {loadingSol ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                      <div style={{ width: 24, height: 24, border: "2px solid rgba(124,58,237,0.3)", borderTop: "2px solid #7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      <p style={{ fontSize: 9, letterSpacing: "0.3em", color: C.muted, fontFamily: "'DM Mono',monospace" }}>LOADING SUBMISSIONS…</p>
                    </div>
                  ) : currentSol ? (
                    <SubmissionDetail submission={currentSol} />
                  ) : (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, opacity: 0.5 }}>
                      <span style={{ fontSize: 44 }}>🏆</span>
                      <p style={{ fontSize: 10, color: C.muted, letterSpacing: "0.25em", fontFamily: "'DM Mono',monospace" }}>NO ACCEPTED SOLUTIONS YET</p>
                      <p style={{ fontSize: 9, color: "rgba(148,163,184,0.3)", fontFamily: "'DM Mono',monospace" }}>Submit and pass a problem to auto-save here</p>
                    </div>
                  )}
                </div>
              </>

            /* ── NOTE EDITOR VIEW ── */
            ) : activeNote ? (
              <NoteEditor
                note={activeNote}
                onUpdate={patch => updateNote(activeNote.id, patch)}
                onDelete={() => deleteNote(activeNote.id)}
              />

            /* ── EMPTY STATE ── */
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, opacity: 0.5 }}>
                <span style={{ fontSize: 44 }}>📝</span>
                <p style={{ fontSize: 10, color: C.muted, letterSpacing: "0.25em", fontFamily: "'DM Mono',monospace" }}>SELECT OR CREATE A NOTE</p>
                <button onClick={createNote} style={{
                  background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)",
                  borderRadius: 10, color: C.tealL, fontSize: 11,
                  fontFamily: "'DM Mono',monospace", letterSpacing: "0.1em",
                  padding: "9px 22px", cursor: "pointer",
                }}>
                  + NEW NOTE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;
