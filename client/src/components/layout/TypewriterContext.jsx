/**
 * TypewriterContext.jsx
 * Global toggle for the "digital writing" typewriter effect in the problem description.
 * Usage:
 *   const { typewriterEnabled, toggleTypewriter } = useTypewriter();
 */
import { createContext, useContext, useState } from "react";

const TypewriterContext = createContext({
  typewriterEnabled: false,
  toggleTypewriter: () => {},
});

export const TypewriterProvider = ({ children }) => {
  const stored = localStorage.getItem("typewriterEffect");
  const [typewriterEnabled, setTypewriterEnabled] = useState(
    stored === null ? false : stored === "true"
  );

  const toggleTypewriter = () => {
    setTypewriterEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("typewriterEffect", String(next));
      return next;
    });
  };

  return (
    <TypewriterContext.Provider value={{ typewriterEnabled, toggleTypewriter }}>
      {children}
    </TypewriterContext.Provider>
  );
};

export const useTypewriter = () => useContext(TypewriterContext);

export default TypewriterContext;
