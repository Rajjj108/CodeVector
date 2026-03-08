import gsap from "gsap";
import { useRef } from "react";

const LANGUAGES = [
  { id: "javascript", label: "JS",     full: "JavaScript", color: "#fbbf24" },
  { id: "python",     label: "PY",     full: "Python",     color: "#34d399" },
  { id: "java",       label: "JAVA",   full: "Java",       color: "#f87171" },
  { id: "cpp",        label: "C++",    full: "C++",        color: "#a78bfa" },
];

const LanguageSwitcher = ({ language, setLanguage }) => {
  const btnRefs = useRef([]);

  const onHover = (e, enter) => {
    gsap.to(e.currentTarget, {
      scale: enter ? 1.06 : 1,
      y: enter ? -1 : 0,
      duration: 0.22, ease: "power2.out",
    });
  };

  return (
    <div style={{
      display: "flex", gap: 5,
      background: "rgba(0,0,0,0.25)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: "4px",
      backdropFilter: "blur(12px)",
    }}>
      {LANGUAGES.map((lang, i) => {
        const isActive = language === lang.id;
        return (
          <button
            key={lang.id}
            ref={(el) => (btnRefs.current[i] = el)}
            onClick={() => setLanguage(lang.id)}
            onMouseEnter={(e) => !isActive && onHover(e, true, lang)}
            onMouseLeave={(e) => !isActive && onHover(e, false, lang)}
            title={lang.full}
            style={{
              fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
              padding: "6px 12px", borderRadius: 8, cursor: "pointer",
              fontFamily: "'DM Mono', monospace", border: "none",
              background: isActive ? `${lang.color}18` : "transparent",
              color: isActive ? lang.color : "rgba(148,163,184,0.45)",
              boxShadow: isActive ? `0 0 0 1px ${lang.color}35` : "none",
              transition: "color 0.2s, background 0.2s, box-shadow 0.2s",
            }}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;