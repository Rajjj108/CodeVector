/**
 * Loader.jsx — Shared loading spinner
 *
 * Matches the DSA Tracker ProblemList style:
 *   - Green spin ring
 *   - Monospace tracking label
 *   - Optional glass card wrapper (standalone mode)
 *
 * Props:
 *   label   — text shown below spinner  (default: "LOADING")
 *   size    — ring diameter in px       (default: 13)
 *   card    — wrap in a frosted card    (default: false)
 *   center  — center with padding       (default: true)
 */
const Loader = ({
  label = "LOADING",
  size = 13,
  card = false,
  center = true,
}) => {
  const spinner = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: center ? "center" : undefined,
        gap: 10,
      }}
    >
      {/* Ring */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `${size <= 13 ? 1.5 : 2}px solid rgba(52,211,153,0.2)`,
          borderTopColor: "#34d399",
          animation: "spin 1s linear infinite",
          flexShrink: 0,
        }}
      />
      {/* Label */}
      {label && (
        <span
          style={{
            fontSize: 9,
            color: "rgba(52,211,153,0.45)",
            letterSpacing: "0.4em",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );

  const inner = center ? (
    <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
      {spinner}
    </div>
  ) : spinner;

  if (!card) return inner;

  return (
    <div
      style={{
        marginTop: 14,
        padding: "16px",
        background: "linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.01) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        backdropFilter: "blur(12px)",
      }}
    >
      {inner}
    </div>
  );
};

export default Loader;
