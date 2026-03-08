/**
 * ThemeContext.jsx
 * 3-mode theme system: cyber | night 
 * Applies data-theme to <html>, plus a GSAP flash overlay for silky transitions.
 */
import { createContext, useContext, useState, useEffect, useRef } from "react";
import gsap from "gsap";

export const THEMES = {
  cyber: {
    id:    "cyber",
    label: "Cyber",
    icon:  "◈",
    desc:  "Neon Dark",
  },
  night: {
    id:    "night",
    label: "Night",
    icon:  "◎",
    desc:  "Deep Dark",
  },
};

const ThemeContext = createContext({
  theme: "cyber",
  setTheme: () => {},
  themes: THEMES,
});

export const ThemeProvider = ({ children }) => {
  const stored = localStorage.getItem("appTheme") || "cyber";
  const [theme, setThemeState] = useState(stored);
  const overlayRef = useRef(null);

  /* Apply data-theme to <html> on mount + every change */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (next) => {
    if (next === theme) return;

    /* Create a temporary full-screen flash overlay */
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99999;pointer-events:none;
      background:${next === "day" ? "#fff" : "#03040c"};
      opacity:0;
    `;
    document.body.appendChild(overlay);
    overlayRef.current = overlay;

    gsap.to(overlay, {
      opacity: 0.55,
      duration: 0.22,
      ease: "power2.in",
      onComplete: () => {
        /* Switch theme while screen is at peak opacity */
        document.documentElement.setAttribute("data-theme", next);
        setThemeState(next);
        localStorage.setItem("appTheme", next);
        /* Fade back out */
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.38,
          ease: "power2.out",
          onComplete: () => document.body.removeChild(overlay),
        });
      },
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
