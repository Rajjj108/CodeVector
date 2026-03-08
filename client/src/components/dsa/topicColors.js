/**
 * topicColors.js
 *
 * Single source of truth for DSA topic colours.
 * Every topic gets a specific { color, glow } pair.
 * Unknown topics fall back to the FALLBACK_PALETTE (index-based).
 */

/* ── Named topic colours ── */
const TOPIC_COLOR_MAP = {
  // Data Structures
  "Array":                   { color: "#a78bfa", glow: "rgba(167,139,250,0.30)" },
  "Hash Table":              { color: "#22d3ee", glow: "rgba(34,211,238,0.30)"  },
  "Linked List":             { color: "#38bdf8", glow: "rgba(56,189,248,0.30)"  },
  "Stack":                   { color: "#fb923c", glow: "rgba(251,146,60,0.30)"  },
  "Queue":                   { color: "#f472b6", glow: "rgba(244,114,182,0.30)" },
  "Tree":                    { color: "#34d399", glow: "rgba(52,211,153,0.30)"  },
  "Binary Tree":             { color: "#4ade80", glow: "rgba(74,222,128,0.30)"  },
  "Binary Search Tree":      { color: "#86efac", glow: "rgba(134,239,172,0.30)" },
  "Trie":                    { color: "#5eead4", glow: "rgba(94,234,212,0.30)"  },
  "Heap (Priority Queue)":   { color: "#f87171", glow: "rgba(248,113,113,0.30)" },
  "Graph":                   { color: "#fbbf24", glow: "rgba(251,191,36,0.30)"  },
  "Matrix":                  { color: "#c084fc", glow: "rgba(192,132,252,0.30)" },

  // Algorithms
  "Dynamic Programming":     { color: "#818cf8", glow: "rgba(129,140,248,0.30)" },
  "Greedy":                  { color: "#34d399", glow: "rgba(52,211,153,0.30)"  },
  "Backtracking":            { color: "#e879f9", glow: "rgba(232,121,249,0.30)" },
  "Divide and Conquer":      { color: "#2dd4bf", glow: "rgba(45,212,191,0.30)"  },
  "Recursion":               { color: "#a3e635", glow: "rgba(163,230,53,0.30)"  },
  "Memoization":             { color: "#67e8f9", glow: "rgba(103,232,249,0.30)" },

  // Search / Sort
  "Binary Search":           { color: "#60a5fa", glow: "rgba(96,165,250,0.30)"  },
  "Sorting":                 { color: "#f472b6", glow: "rgba(244,114,182,0.30)" },
  "Merge Sort":              { color: "#fb7185", glow: "rgba(251,113,133,0.30)" },
  "Quickselect":             { color: "#fda4af", glow: "rgba(253,164,175,0.30)" },
  "Bucket Sort":             { color: "#fdba74", glow: "rgba(253,186,116,0.30)" },
  "Radix Sort":              { color: "#fcd34d", glow: "rgba(252,211,77,0.30)"  },
  "Counting Sort":           { color: "#d9f99d", glow: "rgba(217,249,157,0.30)" },

  // Techniques
  "Two Pointers":            { color: "#22d3ee", glow: "rgba(34,211,238,0.30)"  },
  "Sliding Window":          { color: "#38bdf8", glow: "rgba(56,189,248,0.30)"  },
  "Prefix Sum":              { color: "#c084fc", glow: "rgba(192,132,252,0.30)" },
  "Monotonic Stack":         { color: "#fb923c", glow: "rgba(251,146,60,0.30)"  },
  "Monotonic Queue":         { color: "#f97316", glow: "rgba(249,115,22,0.30)"  },

  // Graph algorithms
  "Depth-First Search":      { color: "#4ade80", glow: "rgba(74,222,128,0.30)"  },
  "Breadth-First Search":    { color: "#34d399", glow: "rgba(52,211,153,0.30)"  },
  "Union Find":              { color: "#fbbf24", glow: "rgba(251,191,36,0.30)"  },
  "Topological Sort":        { color: "#a78bfa", glow: "rgba(167,139,250,0.30)" },
  "Shortest Path":           { color: "#38bdf8", glow: "rgba(56,189,248,0.30)"  },

  // String
  "String":                  { color: "#22d3ee", glow: "rgba(34,211,238,0.30)"  },
  "String Matching":         { color: "#06b6d4", glow: "rgba(6,182,212,0.30)"   },
  "Rolling Hash":            { color: "#67e8f9", glow: "rgba(103,232,249,0.30)" },
  "Suffix Array":            { color: "#a5f3fc", glow: "rgba(165,243,252,0.30)" },

  // Math / Bits
  "Math":                    { color: "#fbbf24", glow: "rgba(251,191,36,0.30)"  },
  "Number Theory":           { color: "#fcd34d", glow: "rgba(252,211,77,0.30)"  },
  "Combinatorics":           { color: "#fde68a", glow: "rgba(253,230,138,0.30)" },
  "Bit Manipulation":        { color: "#f87171", glow: "rgba(248,113,113,0.30)" },
  "Bitmask":                 { color: "#fca5a5", glow: "rgba(252,165,165,0.30)" },

  // Advanced structures
  "Segment Tree":            { color: "#818cf8", glow: "rgba(129,140,248,0.30)" },
  "Binary Indexed Tree":     { color: "#6366f1", glow: "rgba(99,102,241,0.30)"  },
  "Doubly-Linked List":      { color: "#38bdf8", glow: "rgba(56,189,248,0.30)"  },
  "Ordered Set":             { color: "#a78bfa", glow: "rgba(167,139,250,0.30)" },
  "Design":                  { color: "#e879f9", glow: "rgba(232,121,249,0.30)" },

  // Misc
  "Simulation":              { color: "#94a3b8", glow: "rgba(148,163,184,0.30)" },
  "Geometry":                { color: "#2dd4bf", glow: "rgba(45,212,191,0.30)"  },
  "Counting":                { color: "#86efac", glow: "rgba(134,239,172,0.30)" },
  "Enumeration":             { color: "#bbf7d0", glow: "rgba(187,247,208,0.30)" },
  "Game Theory":             { color: "#f472b6", glow: "rgba(244,114,182,0.30)" },
  "Brainteaser":             { color: "#fb923c", glow: "rgba(251,146,60,0.30)"  },
  "Randomized":              { color: "#a3e635", glow: "rgba(163,230,53,0.30)"  },
  "Interactive":             { color: "#34d399", glow: "rgba(52,211,153,0.30)"  },
  "Concurrency":             { color: "#818cf8", glow: "rgba(129,140,248,0.30)" },
  "Database":                { color: "#60a5fa", glow: "rgba(96,165,250,0.30)"  },
  "Shell":                   { color: "#94a3b8", glow: "rgba(148,163,184,0.30)" },
};

/* ── Fallback palette (cycling colours for unlisted topics) ── */
const FALLBACK_PALETTE = [
  { color: "#a78bfa", glow: "rgba(167,139,250,0.30)" },
  { color: "#22d3ee", glow: "rgba(34,211,238,0.30)"  },
  { color: "#f472b6", glow: "rgba(244,114,182,0.30)" },
  { color: "#34d399", glow: "rgba(52,211,153,0.30)"  },
  { color: "#fbbf24", glow: "rgba(251,191,36,0.30)"  },
  { color: "#38bdf8", glow: "rgba(56,189,248,0.30)"  },
  { color: "#c084fc", glow: "rgba(192,132,252,0.30)" },
  { color: "#fb923c", glow: "rgba(251,146,60,0.30)"  },
  { color: "#f87171", glow: "rgba(248,113,113,0.30)" },
  { color: "#4ade80", glow: "rgba(74,222,128,0.30)"  },
];

/* Stable index for unlisted topics so the same topic always gets
   the same fallback colour within a session. */
const _fallbackCache = {};
let   _fallbackIdx   = 0;

/**
 * getTopicStyle(topic) → { color: string, glow: string }
 *
 * Returns a fixed colour pair for any topic name.
 * Named topics use the curated map; unknown topics get a stable
 * fallback colour from the cycling palette.
 */
export const getTopicStyle = (topic) => {
  if (!topic) return FALLBACK_PALETTE[0];

  if (TOPIC_COLOR_MAP[topic]) return TOPIC_COLOR_MAP[topic];

  // Stable fallback: assign once, reuse forever
  if (_fallbackCache[topic] === undefined) {
    _fallbackCache[topic] = _fallbackIdx % FALLBACK_PALETTE.length;
    _fallbackIdx++;
  }
  return FALLBACK_PALETTE[_fallbackCache[topic]];
};

/**
 * getTopicColor(topic) → hex string (just the color, no glow)
 * Convenience wrapper for places that only need the hex.
 */
export const getTopicColor = (topic) => getTopicStyle(topic).color;
