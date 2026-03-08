/**
 * HoverRow.jsx
 *
 * Reusable hover-highlighted row. Used for problem list items,
 * sidebar rows, activity entries — anywhere that needs a hover glow.
 *
 * Props:
 *   accent      {string}  – accent hex for hover glow, default "#a78bfa"
 *   padding     {string}  – default "10px 14px"
 *   radius      {number}  – border-radius in px, default 10
 *   onClick     {fn}
 *   style, className, children
 */
import { useState } from "react";

const HoverRow = ({
  accent    = "#a78bfa",
  padding   = "10px 14px",
  radius    = 10,
  onClick,
  style     = {},
  className = "",
  children,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`hover-row ${className}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding,
        borderRadius:  radius,
        cursor:        onClick ? "pointer" : "default",
        background:    hovered
          ? `${accent}12`
          : "rgba(255,255,255,0.024)",
        border:       `1px solid ${hovered ? `${accent}30` : "rgba(255,255,255,0.04)"}`,
        boxShadow:     hovered
          ? `0 0 24px ${accent}14, inset 0 1px 0 ${accent}18`
          : "none",
        transition:   "background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default HoverRow;
