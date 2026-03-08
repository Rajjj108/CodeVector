/**
 * Whiteboard.jsx — Object-model canvas whiteboard
 *
 * Architecture: every stroke / shape / text is stored as a JS object.
 * The canvas is re-rendered from the object list on every change, which
 * enables select / move / delete of individual elements.
 *
 * Tools: Select · Pencil · Marker · Text · Line · Rect · Circle · Arrow · Eraser
 * Features: undo (30 lvls) · clear · live px size label · save to Notes
 */
import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import axios from "axios";
import { useTheme } from "../layout/ThemeContext";

/* ─────────────────────────────────── helpers ── */
let _id = 0;
const uid = () => ++_id;

const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);

/** Distance from point P to segment A→B */
const distToSeg = (px, py, ax, ay, bx, by) => {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return dist(px, py, ax, ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return dist(px, py, ax + t * dx, ay + t * dy);
};

/** Bounding box { x, y, w, h } for any object */
const getBBox = (obj, pad = 0) => {
  if (obj.type === "text") {
    const fw = obj.text.length * obj.size * 0.65 + 4;
    const fh = obj.size * 1.4;
    return { x: obj.x - pad, y: obj.y - fh - pad, w: fw + pad * 2, h: fh + pad * 2 };
  }
  if (obj.points) {
    const xs = obj.points.map(p => p.x);
    const ys = obj.points.map(p => p.y);
    const x  = Math.min(...xs), y = Math.min(...ys);
    return { x: x - pad, y: y - pad, w: Math.max(...xs) - x + pad * 2, h: Math.max(...ys) - y + pad * 2 };
  }
  const x = Math.min(obj.x1, obj.x2), y = Math.min(obj.y1, obj.y2);
  const w = Math.abs(obj.x2 - obj.x1), h = Math.abs(obj.y2 - obj.y1);
  return { x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2 };
};

/** Hit-test a point against an object */
const hitTest = (obj, px, py) => {
  const pad = Math.max(obj.size ?? 4, 8);
  if (obj.type === "text") {
    const bb = getBBox(obj, pad);
    return px >= bb.x && px <= bb.x + bb.w && py >= bb.y && py <= bb.y + bb.h;
  }
  if (obj.type === "rect") {
    const x1 = Math.min(obj.x1, obj.x2), x2 = Math.max(obj.x1, obj.x2);
    const y1 = Math.min(obj.y1, obj.y2), y2 = Math.max(obj.y1, obj.y2);
    return px >= x1 - pad && px <= x2 + pad && py >= y1 - pad && py <= y2 + pad;
  }
  if (obj.type === "circle") {
    const cx = (obj.x1 + obj.x2) / 2, cy = (obj.y1 + obj.y2) / 2;
    const rx = Math.abs(obj.x2 - obj.x1) / 2 + pad;
    const ry = Math.abs(obj.y2 - obj.y1) / 2 + pad;
    return (Math.pow(px - cx, 2) / Math.pow(rx, 2)) + (Math.pow(py - cy, 2) / Math.pow(ry, 2)) <= 1;
  }
  if (obj.type === "line" || obj.type === "arrow") {
    return distToSeg(px, py, obj.x1, obj.y1, obj.x2, obj.y2) <= pad;
  }
  if (obj.points) {
    for (const p of obj.points) {
      if (dist(px, py, p.x, p.y) <= pad * 1.8) return true;
    }
  }
  return false;
};

/* ─────────────────── draw helpers ── */
const drawArrow = (ctx, x1, y1, x2, y2, sw) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const hs    = Math.max(sw * 4, 14);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  /* head */
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - hs * Math.cos(angle - 0.42), y2 - hs * Math.sin(angle - 0.42));
  ctx.lineTo(x2 - hs * Math.cos(angle + 0.42), y2 - hs * Math.sin(angle + 0.42));
  ctx.closePath();
  ctx.fill();
};

const renderObject = (ctx, obj) => {
  ctx.save();
  ctx.globalAlpha     = obj.alpha ?? 1;
  ctx.globalCompositeOperation = obj.type === "eraser" ? "destination-out" : "source-over";
  ctx.strokeStyle     = obj.color;
  ctx.fillStyle       = obj.color;
  ctx.lineWidth       = obj.size ?? 3;
  ctx.lineCap         = "round";
  ctx.lineJoin        = "round";

  switch (obj.type) {
    case "pencil":
    case "marker":
    case "eraser":
      if (!obj.points || obj.points.length < 2) { ctx.restore(); return; }
      ctx.beginPath();
      ctx.moveTo(obj.points[0].x, obj.points[0].y);
      for (const p of obj.points.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.stroke();
      break;
    case "line":
      ctx.beginPath();
      ctx.moveTo(obj.x1, obj.y1);
      ctx.lineTo(obj.x2, obj.y2);
      ctx.stroke();
      break;
    case "rect":
      ctx.strokeRect(obj.x1, obj.y1, obj.x2 - obj.x1, obj.y2 - obj.y1);
      break;
    case "circle": {
      const cx = (obj.x1 + obj.x2) / 2, cy = (obj.y1 + obj.y2) / 2;
      const rx = Math.abs(obj.x2 - obj.x1) / 2, ry = Math.abs(obj.y2 - obj.y1) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "arrow":
      drawArrow(ctx, obj.x1, obj.y1, obj.x2, obj.y2, obj.size ?? 3);
      break;
    case "text":
      ctx.font         = `700 ${obj.size * 5}px 'DM Sans', sans-serif`;
      ctx.textBaseline = "alphabetic";
      ctx.fillText(obj.text, obj.x, obj.y);
      break;
    default: break;
  }
  ctx.restore();
};

const drawSelectionBox = (ctx, obj) => {
  const bb = getBBox(obj, 8);
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle  = "#a78bfa";
  ctx.lineWidth    = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(bb.x, bb.y, bb.w, bb.h);
  ctx.setLineDash([]);
  /* corner handles */
  ctx.fillStyle = "#a78bfa";
  [[bb.x, bb.y], [bb.x + bb.w, bb.y], [bb.x, bb.y + bb.h], [bb.x + bb.w, bb.y + bb.h]]
    .forEach(([hx, hy]) => {
      ctx.beginPath();
      ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
      ctx.fill();
    });
  ctx.restore();
};

/* ─────────────────────────────── constants ── */
const TOOLS = [
  { id: "select", icon: "↖", label: "Select" },
  { id: "pencil", icon: "✏",  label: "Pencil" },
  { id: "marker", icon: "〣",  label: "Marker" },
  { id: "text",   icon: "T",  label: "Text"   },
  { id: "line",   icon: "╱",  label: "Line"   },
  { id: "rect",   icon: "▭",  label: "Rect"   },
  { id: "circle", icon: "◯",  label: "Circle" },
  { id: "arrow",  icon: "→",  label: "Arrow"  },
  { id: "eraser", icon: "⌫",  label: "Eraser" },
];

const PALETTE = [
  "#e2e8f0", "#a78bfa", "#22d3ee", "#34d399",
  "#fbbf24", "#f87171", "#f472b6", "#fb923c",
  "#ffffff", "#94a3b8", "#1e293b", "#000000",
];

const SIZES = [
  { v: 1, label: "1px" },
  { v: 3, label: "3px" },
  { v: 6, label: "6px" },
  { v: 12, label: "12px" },
  { v: 24, label: "24px" },
];

/* ═══════════════════════════════════ component ══ */
const Whiteboard = ({ onClose }) => {
  const { theme }   = useTheme();
  const isDark      = theme !== "day";

  const overlayRef  = useRef(null);
  const closeRef    = useRef(null);
  const toolbarRef  = useRef(null);
  const canvasRef   = useRef(null);

  /* Drawing state */
  const [tool,    setTool]    = useState("pencil");
  const [color,   setColor]   = useState("#e2e8f0");
  const [size,    setSize]    = useState(3);

  /* Object model */
  const [objects,    setObjects]    = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const objectsRef   = useRef([]);     // always-current copy for callbacks

  useEffect(() => { objectsRef.current = objects; }, [objects]);

  /* Drawing tracking refs */
  const drawing    = useRef(false);
  const curObjRef  = useRef(null);   // object being drawn live
  const startPt    = useRef({ x: 0, y: 0 });

  /* Select-tool drag */
  const selDragRef = useRef(null); // { objId, ox1,oy1,ox2,oy2 or oPoints or ox,oy, startX,startY }
  const isDragging = useRef(false);

  /* Text tool */
  const [textInput, setTextInput] = useState({ active: false, x: 0, y: 0, value: "" });
  const textRef    = useRef(null);

  /* Live px size label */
  const [sizeLabel, setSizeLabel] = useState(null); // { text, x, y } or null

  /* Undo history */
  const history = useRef([]);

  /* Save state */
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  /* ── Render ── */
  const renderAll = useCallback((objs, selId, preview = null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const obj of objs) {
      renderObject(ctx, obj);
      if (obj.id === selId) drawSelectionBox(ctx, obj);
    }
    if (preview) {
      renderObject(ctx, preview);
    }
  }, []);

  useEffect(() => {
    renderAll(objects, selectedId, curObjRef.current);
  }, [objects, selectedId, renderAll]);

  /* ── Resize canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setSize_ = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      renderAll(objectsRef.current, selectedId);
    };
    setSize_();
    window.addEventListener("resize", setSize_);
    return () => window.removeEventListener("resize", setSize_);
  }, [renderAll, selectedId]);

  /* ── Entrance ── */
  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.28, ease: "power2.out" });
    gsap.fromTo(toolbarRef.current, { y: -44, opacity: 0 }, { y: 0, opacity: 1, delay: 0.05, duration: 0.4, ease: "expo.out" });
    gsap.fromTo(closeRef.current,   { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, delay: 0.15, duration: 0.4, ease: "back.out(1.6)" });
  }, []);

  /* ── Close ── */
  const handleClose = useCallback(() => {
    gsap.to([toolbarRef.current, canvasRef.current], { opacity: 0, y: -18, duration: 0.22, stagger: 0.04, ease: "power2.in" });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.28, delay: 0.1, onComplete: onClose });
  }, [onClose]);

  /* ESC + Delete key */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape")  { if (!textInput.active) handleClose(); }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId !== null && !textInput.active) {
        history.current.push([...objectsRef.current]);
        setObjects(os => os.filter(o => o.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose, selectedId, textInput.active]);

  /* ── Get canvas position ── */
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  /* ── Undo ── */
  const undo = () => {
    if (!history.current.length) return;
    setObjects(history.current.pop());
    setSelectedId(null);
  };

  /* ── Clear ── */
  const clear = () => {
    history.current.push([...objectsRef.current]);
    setObjects([]);
    setSelectedId(null);
  };

  /* ── Text commit ── */
  const commitText = useCallback(() => {
    if (!textInput.active) return;
    const val = textInput.value.trim();
    if (val) {
      const obj = { id: uid(), type: "text", color, size, x: textInput.x, y: textInput.y, text: val };
      history.current.push([...objectsRef.current]);
      setObjects(os => [...os, obj]);
    }
    setTextInput({ active: false, x: 0, y: 0, value: "" });
  }, [textInput, color, size]);

  /* ── Pointer down ── */
  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    const p = getPos(e);

    /* ── Select tool ── */
    if (tool === "select") {
      /* Find top-most object under cursor */
      const hit = [...objectsRef.current].reverse().find(o => hitTest(o, p.x, p.y));
      if (hit) {
        setSelectedId(hit.id);
        isDragging.current = true;
        const ref = { objId: hit.id, startX: p.x, startY: p.y };
        if (hit.points)          ref.origPts  = hit.points.map(pt => ({ ...pt }));
        else if (hit.type === "text") { ref.ox = hit.x; ref.oy = hit.y; }
        else { ref.ox1 = hit.x1; ref.oy1 = hit.y1; ref.ox2 = hit.x2; ref.oy2 = hit.y2; }
        selDragRef.current = ref;
      } else {
        setSelectedId(null);
        isDragging.current = false;
        selDragRef.current = null;
      }
      return;
    }

    /* ── Text tool ── */
    if (tool === "text") {
      setTextInput({ active: true, x: p.x, y: p.y, value: "" });
      setTimeout(() => textRef.current?.focus(), 50);
      return;
    }

    /* ── Drawing tools ── */
    drawing.current = true;
    history.current.push([...objectsRef.current]);

    const isPath = tool === "pencil" || tool === "marker" || tool === "eraser";
    const obj = {
      id:    uid(),
      type:  tool,
      color,
      size,
      alpha: tool === "marker" ? 0.5 : 1,
      ...(isPath ? { points: [{ x: p.x, y: p.y }] }
                 : { x1: p.x, y1: p.y, x2: p.x, y2: p.y }),
    };
    curObjRef.current = obj;
    startPt.current   = p;
    setSizeLabel(null);
  }, [tool, color, size]);

  /* ── Pointer move ── */
  const onPointerMove = useCallback((e) => {
    if (!drawing.current && !isDragging.current) return;
    e.preventDefault();
    const p = getPos(e);

    /* Drag selected object */
    if (isDragging.current && selDragRef.current) {
      const dr  = selDragRef.current;
      const dx  = p.x - dr.startX, dy = p.y - dr.startY;
      setObjects(os => os.map(o => {
        if (o.id !== dr.objId) return o;
        if (o.points)          return { ...o, points: dr.origPts.map(pt => ({ x: pt.x + dx, y: pt.y + dy })) };
        if (o.type === "text") return { ...o, x: dr.ox + dx, y: dr.oy + dy };
        return { ...o, x1: dr.ox1 + dx, y1: dr.oy1 + dy, x2: dr.ox2 + dx, y2: dr.oy2 + dy };
      }));
      return;
    }

    /* Update current drawing object */
    const obj = curObjRef.current;
    if (!obj) return;

    if (obj.points) {
      obj.points.push({ x: p.x, y: p.y });
    } else {
      obj.x2 = p.x;
      obj.y2 = p.y;
      /* Live size label */
      const w = Math.abs(obj.x2 - obj.x1);
      const h = Math.abs(obj.y2 - obj.y1);
      if (obj.type === "line" || obj.type === "arrow") {
        const len = Math.round(Math.hypot(w, h));
        setSizeLabel({ text: `${len}px`, x: p.x + 10, y: p.y - 8 });
      } else {
        setSizeLabel({ text: `${Math.round(w)}×${Math.round(h)}px`, x: p.x + 10, y: p.y - 8 });
      }
    }

    renderAll(objectsRef.current, selectedId, curObjRef.current);
  }, [renderAll, selectedId]);

  /* ── Pointer up ── */
  const onPointerUp = useCallback(() => {
    if (isDragging.current) { isDragging.current = false; selDragRef.current = null; return; }
    if (!drawing.current) return;
    drawing.current = false;
    const obj = curObjRef.current;
    if (obj) {
      setObjects(os => [...os, { ...obj }]);
    }
    curObjRef.current = null;
    setSizeLabel(null);
  }, []);

  /* ── Save to Notes ── */
  const saveToNotes = async () => {
    setSaving(true);
    try {
      const token   = localStorage.getItem("token");
      const dataUrl = canvasRef.current.toDataURL("image/png");
      await axios.post(
        (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/notes",
        { title: `Whiteboard — ${new Date().toLocaleString()}`, content: `![Whiteboard](${dataUrl})\n\n*Saved from whiteboard*` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { console.error(err); }
    finally       { setSaving(false); }
  };

  /* Close-btn hover */
  const xIn  = () => gsap.to(closeRef.current, { scale: 1.15, rotation: 90,  duration: 0.22, ease: "power2.out" });
  const xOut = () => gsap.to(closeRef.current, { scale: 1,    rotation: 0,   duration: 0.22, ease: "power2.out" });

  /* Colours */
  const bg          = isDark ? "rgba(6,8,16,0.96)"       : "rgba(194,232,255,0.97)";
  const panelBg     = isDark ? "rgba(255,255,255,0.04)"  : "rgba(255,255,255,0.82)";
  const border      = isDark ? "rgba(255,255,255,0.07)"  : "rgba(5,37,88,0.13)";
  const textColor   = isDark ? "#e2e8f0"                 : "#011023";
  const labelColor  = isDark ? "rgba(167,139,250,0.65)"  : "rgba(5,37,88,0.5)";

  return createPortal(
    <div ref={overlayRef} style={{ position:"fixed", inset:0, zIndex:99999, background:bg, display:"flex", flexDirection:"column", overflow:"hidden" }}>

      {/* ── Toolbar ── */}
      <div ref={toolbarRef} style={{
        display:"flex", alignItems:"center", gap:8, padding:"12px 20px",
        background:panelBg, backdropFilter:"blur(28px) saturate(180%)",
        borderBottom:`1px solid ${border}`, flexWrap:"wrap", position:"relative", zIndex:10,
      }}>

        {/* Label */}
        <span style={{ fontSize:10, letterSpacing:"0.4em", fontFamily:"'DM Mono',monospace", color:labelColor, marginRight:4, whiteSpace:"nowrap" }}>WHITEBOARD</span>
        <Sep border={border} />

        {/* Tools */}
        {TOOLS.map(t => {
          const active = tool === t.id;
          return (
            <button key={t.id} title={t.label} onClick={() => setTool(t.id)} style={{
              width:34, height:34, borderRadius:9, cursor:"pointer", fontSize:15,
              background: active ? "rgba(167,139,250,0.2)"  : "transparent",
              border:     active ? "1px solid rgba(167,139,250,0.5)" : `1px solid ${border}`,
              color:      active ? "#a78bfa" : textColor,
              boxShadow:  active ? "0 0 12px rgba(167,139,250,0.28)" : "none",
              transition: "all 0.15s ease",
              display:"flex", alignItems:"center", justifyContent:"center", fontWeight:active?800:400,
            }}>{t.icon}</button>
          );
        })}

        <Sep border={border} />

        {/* Palette */}
        {PALETTE.map(c => (
          <button key={c} onClick={() => setColor(c)} title={c} style={{
            width: color===c ? 22 : 17, height: color===c ? 22 : 17,
            borderRadius:"50%", background:c, cursor:"pointer", flexShrink:0,
            border: color===c ? "2.5px solid rgba(255,255,255,0.9)" : `1.5px solid ${border}`,
            boxShadow: color===c ? `0 0 10px ${c}88` : "none",
            transition:"all 0.14s ease",
          }} />
        ))}

        <Sep border={border} />

        {/* Sizes */}
        {SIZES.map(s => (
          <button key={s.v} title={`${s.label}`} onClick={() => setSize(s.v)} style={{
            minWidth:34, height:34, borderRadius:9, cursor:"pointer",
            background: size===s.v ? "rgba(167,139,250,0.16)" : "transparent",
            border: `1.5px solid ${size===s.v ? "rgba(167,139,250,0.45)" : border}`,
            display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:2,
            transition:"all 0.14s ease", padding:"0 6px",
          }}>
            <div style={{ width:Math.min(s.v*2,18), height:Math.min(s.v*2,18), borderRadius:"50%", background:color, transition:"all 0.14s" }} />
            <span style={{ fontSize:7, color:textColor, opacity:0.5, fontFamily:"'DM Mono',monospace" }}>{s.label}</span>
          </button>
        ))}

        <Sep border={border} />

        {/* Actions */}
        {selectedId !== null && (
          <button
            title="Delete selected (Del)"
            onClick={() => {
              history.current.push([...objectsRef.current]);
              setObjects(os => os.filter(o => o.id !== selectedId));
              setSelectedId(null);
            }}
            style={{ ...actionBtn(border, "#f87171"), background:"rgba(248,113,113,0.12)", borderColor:"rgba(248,113,113,0.35)", boxShadow:"0 0 12px rgba(248,113,113,0.2)" }}
          >🗑 Delete</button>
        )}

        <button onClick={undo}  style={actionBtn(border, textColor)}>↩ Undo</button>
        <button onClick={clear} style={actionBtn(border, textColor)}>⌧ Clear</button>
        <button
          onClick={saveToNotes}
          disabled={saving}
          style={{
            ...actionBtn(border, saving ? textColor : saved ? "#34d399" : "#a78bfa"),
            background: saved ? "rgba(52,211,153,0.15)" : "rgba(167,139,250,0.12)",
            borderColor: saved ? "rgba(52,211,153,0.4)" : "rgba(167,139,250,0.38)",
            boxShadow:   saved ? "0 0 12px rgba(52,211,153,0.28)" : "none",
          }}
        >{saved ? "✓ Saved!" : saving ? "Saving…" : "📋 Save to Notes"}</button>

        <div style={{ flex:1 }} />

        {/* ✕ close */}
        <button
          ref={closeRef}
          onClick={handleClose}
          onMouseEnter={xIn}
          onMouseLeave={xOut}
          aria-label="Close whiteboard"
          style={{
            width:40, height:40, borderRadius:"50%", cursor:"pointer", fontSize:17,
            background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.25)",
            color:"#f87171", display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 0 18px rgba(248,113,113,0.14)", flexShrink:0,
          }}
        >✕</button>
      </div>

      {/* ── Canvas area ── */}
      <div style={{ flex:1, position:"relative", overflow:"hidden" }}>

        {/* Grid dots */}
        <div style={{
          position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
          backgroundImage: isDark
            ? "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)"
            : "radial-gradient(rgba(5,37,88,0.09) 1px, transparent 1px)",
          backgroundSize:"28px 28px",
        }} />

        <canvas
          ref={canvasRef}
          style={{
            position:"absolute", inset:0, width:"100%", height:"100%",
            zIndex:1, touchAction:"none",
            cursor: tool === "select"   ? "default"
                  : tool === "eraser"   ? "cell"
                  : tool === "text"     ? "text"
                  : "crosshair",
          }}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        />

        {/* ── Text input overlay ── */}
        {textInput.active && (
          <div style={{ position:"absolute", left:textInput.x, top:textInput.y - size*5 - 2, zIndex:20, pointerEvents:"all" }}>
            <input
              ref={textRef}
              value={textInput.value}
              onChange={e => setTextInput(t => ({ ...t, value: e.target.value }))}
              onKeyDown={e => {
                if (e.key === "Enter") { e.preventDefault(); commitText(); }
                if (e.key === "Escape") { setTextInput({ active:false, x:0, y:0, value:"" }); }
              }}
              onBlur={commitText}
              style={{
                background:    "transparent",
                border:        "none",
                borderBottom:  `2px solid ${color}`,
                outline:       "none",
                color,
                fontSize:      size * 5,
                fontFamily:    "'DM Sans', sans-serif",
                fontWeight:    700,
                minWidth:      120,
                caretColor:    color,
                padding:       "0 2px",
              }}
              placeholder="Type here…"
            />
          </div>
        )}

        {/* ── Live px size label ── */}
        {sizeLabel && (
          <div style={{
            position:"absolute", left:sizeLabel.x, top:sizeLabel.y,
            zIndex:20, pointerEvents:"none",
            background: isDark ? "rgba(6,8,16,0.82)" : "rgba(255,255,255,0.9)",
            border:`1px solid ${border}`,
            borderRadius:6, padding:"2px 8px",
            fontSize:10, fontFamily:"'DM Mono',monospace",
            color: textColor, letterSpacing:"0.06em",
            boxShadow:"0 2px 12px rgba(0,0,0,0.2)",
          }}>{sizeLabel.text}</div>
        )}

        {/* ── Select-mode hint ── */}
        {tool === "select" && objects.length > 0 && (
          <div style={{
            position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)",
            zIndex:20, pointerEvents:"none",
            background: isDark ? "rgba(6,8,16,0.78)" : "rgba(255,255,255,0.88)",
            border:`1px solid ${border}`, borderRadius:8, padding:"5px 16px",
            fontSize:9.5, fontFamily:"'DM Mono',monospace", color:textColor, opacity:0.7,
            letterSpacing:"0.1em",
          }}>
            {selectedId ? "DRAG TO MOVE  ·  DEL TO DELETE" : "CLICK AN ELEMENT TO SELECT"}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

/* ── Sub-components ── */
const Sep = ({ border }) => (
  <div style={{ width:1, height:26, background:border, flexShrink:0, margin:"0 2px" }} />
);

const actionBtn = (border, color) => ({
  padding:"6px 12px", borderRadius:8,
  background:"transparent", border:`1px solid ${border}`,
  color, fontSize:10.5, cursor:"pointer",
  fontFamily:"'DM Mono',monospace", letterSpacing:"0.06em",
  whiteSpace:"nowrap", transition:"all 0.16s ease",
});

export default Whiteboard;
