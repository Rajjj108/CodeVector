/**
 * useIsMobile.js
 * Returns { isMobile, isTablet, isDesktop } based on window width.
 * Re-evaluates on resize.
 */
import { useState, useEffect } from "react";

export const useIsMobile = () => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handle = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return {
    isMobile:  width < 640,
    isTablet:  width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
};
