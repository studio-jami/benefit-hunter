import { useEffect, useRef, useState } from "react";

// Sibling of MultiSelectDropdown — same button shape, single-select semantics.
// Used for Sort where only one value is active at a time.
export function SingleSelectDropdown({ label, value, items, onChange, getLabel }) {
  const [open, setOpen] = useState(false);
  const [align, setAlign] = useState("left");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const panelW = 240;
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
          background:"var(--surface-2)", color:"var(--text)",
          border:"1px solid var(--line)",
          borderRadius:3, padding:"5px 10px", cursor:"pointer",
          fontFamily:"monospace", display:"inline-flex", alignItems:"center", gap:6,
          minHeight:28, whiteSpace:"nowrap",
        }}
      >
        <span>{label}</span>
        <span style={{ fontSize:7, color:"var(--text-dim2)" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)",
          ...(align === "right" ? { right: 0 } : { left: 0 }),
          zIndex:30,
          background:"var(--surface-2)", border:"1px solid var(--line)", borderRadius:4,
          minWidth:220, maxHeight:340, overflowY:"auto",
          padding:6, boxShadow:"0 10px 28px rgba(0,0,0,0.7)",
        }}>
          {items.map(key => {
            const active = key === value;
            return (
              <button key={key}
                onClick={() => { onChange(key); setOpen(false); }}
                style={{
                  display:"block", width:"100%", textAlign:"left",
                  background: active ? "var(--line-soft)" : "transparent",
                  border:"none",
                  color: active ? "var(--text)" : "var(--text)",
                  padding:"6px 10px", borderRadius:3, cursor:"pointer",
                  fontSize:10, fontFamily:"monospace", letterSpacing:"0.04em",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--line-soft)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                {active ? "● " : "○ "}{getLabel(key)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
