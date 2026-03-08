import Editor from "@monaco-editor/react";
import { useRef } from "react";
import MissionFailedOverlay from "./MissionFailedOverlay";
import { useTheme } from "../layout/ThemeContext";

const LANG_LABEL = {
  javascript: { label: "JavaScript", color: "#fbbf24" },
  python:     { label: "Python",     color: "#34d399" },
  java:       { label: "Java",       color: "#f472b6" },
  cpp:        { label: "C++",        color: "#22d3ee" },
};

// Monaco language identifier map
const MONACO_LANG_MAP = {
  javascript: "javascript",
  python:     "python",
  java:       "java",
  cpp:        "cpp",
};

const EditorPanel = ({
  code,
  setCode,
  language = "javascript",
  onFocus,
  onBlur,
  onEditorMount,
  activeDisplay = "00:00",
  isFocused     = false,
  showWarning   = false,   // show GTA mission-failed overlay
  onDismiss     = null,    // called when overlay dismissed
}) => {
  const editorRef  = useRef(null);
  const lang       = LANG_LABEL[language] || LANG_LABEL.javascript;
  const monacoLang = MONACO_LANG_MAP[language] || "javascript";
  const { theme }  = useTheme();
  const monacoTheme = theme === "day" ? "vs" : "vs-dark";

  const handleMount = (editor) => {
    editorRef.current = editor;
    editor.updateOptions({
      fontFamily:          "'DM Mono', 'Fira Code', monospace",
      fontSize:            13,
      lineHeight:          22,
      minimap:             { enabled: false },
      scrollbar:           { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
      padding:             { top: 16, bottom: 16 },
      roundedSelection:    true,
      cursorBlinking:      "smooth",
      smoothScrolling:     true,
      renderLineHighlight: "gutter",
    });

    // Wire focus/blur to parent for active-time tracking
    if (onFocus) editor.onDidFocusEditorText(onFocus);
    if (onBlur)  editor.onDidBlurEditorText(onBlur);

    // Pass raw editor up so parent can use widget-level events
    if (onEditorMount) onEditorMount(editor);
  };

  // Guard: undefined/null value causes Monaco to spin indefinitely
  if (code === undefined || code === null) return (
    <div style={{
      height:      "100%",
      minHeight:   260,
      display:     "flex",
      alignItems:  "center",
      justifyContent: "center",
      color:       "rgba(148,163,184,0.35)",
      fontFamily:  "'DM Mono', monospace",
      fontSize:    12,
      letterSpacing: "0.1em",
    }}>
      ◈ Loading editor...
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      {/* GTA Mission Failed overlay — scoped to this panel */}
      <MissionFailedOverlay visible={showWarning} onDismiss={onDismiss} />

      {/* ── Top bar ── */}
      <div style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "10px 16px",
        borderBottom:   "1px solid rgba(255,255,255,0.06)",
        background:     "rgba(0,0,0,0.2)",
        flexShrink:     0,
      }}>
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 6 }}>
          {["#f87171", "#fbbf24", "#34d399"].map((c) => (
            <div key={c} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: c, opacity: 0.7,
            }}/>
          ))}
        </div>

        {/* Language badge */}
        <span style={{
          fontSize:      9,
          fontWeight:    800,
          letterSpacing: "0.15em",
          padding:       "3px 9px",
          borderRadius:  7,
          background:    `${lang.color}14`,
          color:         lang.color,
          border:        `1px solid ${lang.color}28`,
          fontFamily:    "'DM Mono', monospace",
        }}>
          {lang.label.toUpperCase()}
        </span>

        {/* Timer — left of line count */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "2px 8px", borderRadius: 6,
          background: isFocused ? "rgba(52,211,153,0.1)" : "transparent",
          border: `1px solid ${isFocused ? "rgba(52,211,153,0.4)" : "rgba(52,211,153,0.1)"}`,
          transition: "background 0.3s, border-color 0.3s",
        }}>
          <span style={{
            fontSize: 9,
            color: isFocused ? "rgba(52,211,153,0.9)" : "rgba(52,211,153,0.3)",
            transition: "color 0.3s",
            lineHeight: 1,
          }}>⏱</span>
          <span style={{
            fontSize: 9,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.12em",
            fontWeight: 700,
            color: isFocused ? "#34d399" : "rgba(52,211,153,0.35)",
            transition: "color 0.3s",
          }}>{activeDisplay}</span>
        </div>

        {/* Line count */}
        <span style={{
          fontSize:   9,
          color:      "rgba(148,163,184,0.35)",
          fontFamily: "'DM Mono', monospace",
        }}>
          {(code || "").split("\n").length} lines
        </span>
      </div>

      {/* ── Monaco ──
          key={monacoLang} is the PRIMARY fix for infinite loading:
          forces a full remount when language changes instead of trying
          to hot-swap the language model which can get stuck.            */}
      <div data-monaco-root style={{ flex: 1, overflow: "hidden" }}>
        <Editor
          key={monacoLang}
          height="100%"
          theme={monacoTheme}
          language={monacoLang}
          value={code}
          onChange={(v) => setCode(v ?? "")}
          onMount={handleMount}
          options={{
            fontFamily:          "'DM Mono', 'Fira Code', monospace",
            fontSize:            13,
            minimap:             { enabled: false },
            scrollbar:           { verticalScrollbarSize: 3, horizontalScrollbarSize: 3 },
            padding:             { top: 14, bottom: 14 },
            renderLineHighlight: "gutter",
            cursorBlinking:      "smooth",
            smoothScrolling:     true,
          }}
        />
      </div>
    </div>
  );
};

export default EditorPanel;