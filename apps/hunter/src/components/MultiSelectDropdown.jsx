import { useEffect, useRef, useState } from "react";
import { toneHighlight } from "../lib/tone";

export function MultiSelectDropdown({ label, total, items, activeSet, onToggle, onClear, getLabel, getCount, getTone }) {
  const [open, setOpen] = useState(false);
  const [align, setAlign] = useState("left");
  const ref = useRef(null);
  const count = activeSet.size;

  useEffect(() => {
    if (!open) return;
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const panelW = 260;
      setAlign(rect.left + panelW > window.innerWidth - 12 ? "right" : "left");
    }
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="filter-dd" style={{ position:"relative", display:"inline-block" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          fontSize:10, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase",
          background: count > 0 ? "var(--line-soft)" : "var(--surface-2)",
          color: count > 0 ? "var(--text)" : "var(--text-dim)",
          border:"1px solid " + (count > 0 ? "var(--line)" : "var(--line)"),
          borderRadius:3, padding:"5px 10px", cursor:"pointer",
          fontFamily:"monospace", display:"inline-flex", alignItems:"center", gap:6,
          minHeight:28,
        }}
      >
        <span>{label}</span>
        {count > 0 && (
          <span style={{
            fontSize:9, color:"#080807", background:"var(--text)",
            padding:"1px 6px", borderRadius:10, fontWeight:700,
          }}>{count}</span>
        )}
        <span style={{ fontSize:7, color:"var(--text-dim2)", marginLeft:2 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)",
          ...(align === "right" ? { right: 0 } : { left: 0 }),
          zIndex:30,
          background:"var(--surface-2)", border:"1px solid var(--line)", borderRadius:4,
          minWidth:240, maxHeight:340, overflowY:"auto",
          padding:6, boxShadow:"0 10px 28px rgba(0,0,0,0.7)",
        }}>
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"space-between",
            padding:"4px 6px 8px", borderBottom:"1px solid var(--line-soft)", marginBottom:4,
            fontSize:8, color:"var(--text-dim2)", letterSpacing:"0.1em", textTransform:"uppercase",
          }}>
            <span>{label} · {total} total</span>
            {count > 0 && (
              <button onClick={onClear} style={{
                background:"transparent", border:"1px solid var(--line)", color:"var(--text-dim)",
                borderRadius:2, padding:"1px 7px", cursor:"pointer",
                fontSize:8, fontFamily:"monospace", letterSpacing:"0.08em",
              }}>× clear</button>
            )}
          </div>
          {items.map(key => {
            const isActive = activeSet.has(key);
            const tone = getTone ? getTone(key) : null;
            const c = getCount(key);
            const activeBg = toneHighlight(tone, 16);
            const activeColor = tone ? `var(--${tone})` : "var(--text)";
            return (
              <label key={key} style={{
                display:"flex", alignItems:"center", gap:8, cursor:"pointer",
                padding:"5px 8px", borderRadius:3,
                background: isActive ? activeBg : "transparent",
                transition:"background 0.1s",
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--line-soft)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => onToggle(key)}
                  style={{ accentColor: "var(--ok)", cursor:"pointer" }}
                />
                <span style={{
                  fontSize:10, fontWeight:600, letterSpacing:"0.04em",
                  color: isActive ? activeColor : "var(--text)", flex:1,
                }}>{getLabel(key)}</span>
                <span style={{
                  fontSize:9, color:"var(--text-dim2)", fontFamily:"monospace",
                }}>{c}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
