/**
 * GlassCard.jsx
 *
 * Universal glass panel component. Reads all colours from CSS
 * custom-properties so it adapts automatically to Cyber / Night / Day theme.
 *
 * Props:
 *   accent      {string}  – optional accent hex e.g. "#a78bfa"
 *                           used for top-edge shimmer & corner glow
 *   accentBg    {string}  – optional tinted background when card has a colour
 *                           e.g. "rgba(167,139,250,0.08)"
 *   accentBorder{string}  – optional coloured border
 *   padding     {string|number} – default "20px 22px"
 *   radius      {number}  – border-radius in px, default 18
 *   style       {object}  – extra inline overrides
 *   className   {string}
 *   onClick     {fn}
 *   children
 */
import { forwardRef } from "react";

const GlassCard = forwardRef(({
  accent       = null,
  accentBg     = null,
  accentBorder = null,
  padding      = "20px 22px",
  radius       = 18,
  style        = {},
  className    = "",
  onClick,
  children,
}, ref) => {

  /* Base background – uses CSS var that shifts per theme:
     Cyber/Night: semi-transparent white glass
     Day:         subtle dark-navy glass (set in index.css vars)       */
  const bg = accentBg
    ?? "linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)";

  const borderColor      = accentBorder ?? "rgba(255,255,255,0.08)";
  const borderTopColor   = accentBorder
    ? accentBorder.replace("0.2)", "0.35)").replace("0.15)", "0.28)")
    : "rgba(255,255,255,0.12)";

  return (
    <div
      ref={ref}
      className={`glass-card ${className}`}
      onClick={onClick}
      style={{
        background:     bg,
        border:        `1px solid ${borderColor}`,
        borderTop:     `1px solid ${borderTopColor}`,
        borderRadius:   radius,
        padding,
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        boxShadow:      "inset 0 1px 0 rgba(255,255,255,0.07), 0 8px 32px rgba(0,0,0,0.28)",
        position:       "relative",
        overflow:       "hidden",
        transition:     "box-shadow 0.25s ease, border-color 0.25s ease",
        ...style,
      }}
    >
      {/* Top-edge shimmer, tinted by accent if given */}
      <div
        aria-hidden
        style={{
          position:   "absolute",
          top: 0, left: "12%", right: "12%",
          height:     "1px",
          background: accent
            ? `linear-gradient(90deg, transparent, ${accent}55, transparent)`
            : "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Corner glow when accent given */}
      {accent && (
        <div
          aria-hidden
          style={{
            position:      "absolute",
            top: 0, left: 0,
            width: 70, height: 70,
            background:    `radial-gradient(circle at 0% 0%, ${accent}20 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
});

GlassCard.displayName = "GlassCard";
export default GlassCard;
