import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_ACCENTS, TOKEN_GROUPS, TOKEN_LABELS, TOKEN_ORDER } from "../data/accentDefaults";
import { applyAccents, oklchString } from "../lib/accents";

// Compact slider with label + numeric readout.
function Slider({ label, min, max, step, value, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        display:"flex", justifyContent:"space-between",
        fontSize:9, color:"var(--text-dim)", letterSpacing:"0.06em",
        textTransform:"uppercase", marginBottom:4,
      }}>
        <span>{label}</span>
        <span style={{ color:"var(--text)", fontFamily:"monospace" }}>
          {Number(value).toFixed(step < 0.01 ? 3 : step < 1 ? 2 : 0)}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width:"100%", accentColor:"var(--accent)", cursor:"pointer",
        }}
      />
    </div>
  );
}

export function AccentsModal({ open, accents, onChange, onClose, onSave, onResetAll, savedFlash }) {
  const [active, setActive] = useState("accent");
  const initial = useRef(accents);

  // Snapshot whatever was saved at open-time, so Cancel can revert.
  useEffect(() => {
    if (open) initial.current = accents;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") handleCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const current = accents[active] || DEFAULT_ACCENTS[active];
  const isDefault = useMemo(() => (
    JSON.stringify(current) === JSON.stringify(DEFAULT_ACCENTS[active])
  ), [current, active]);

  const updateActive = (patch) => {
    onChange({ ...accents, [active]: { ...current, ...patch } });
  };

  const resetToken = () => {
    onChange({ ...accents, [active]: { ...DEFAULT_ACCENTS[active] } });
  };

  const handleCancel = () => {
    onChange(initial.current);
    applyAccents(initial.current);
    onClose();
  };

  return (
    <div onClick={handleCancel} style={{
      position:"fixed", inset:0, zIndex:120,
      background:"rgba(0,0,0,0.65)", backdropFilter:"blur(3px)",
      display:"flex", alignItems:"flex-start", justifyContent:"center",
      padding:"40px 20px", overflowY:"auto",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:"var(--surface-2)", border:"1px solid var(--line)", borderRadius:6,
        width:"100%", maxWidth:780, padding:"20px 22px",
        boxShadow:"0 16px 48px rgba(0,0,0,0.7)",
      }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", marginBottom:14, paddingBottom:10, borderBottom:"1px solid var(--line-soft)" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", letterSpacing:"0.04em" }}>Colors</div>
            <div style={{ fontSize:9, color:"var(--text-dim2)", marginTop:2, letterSpacing:"0.04em" }}>
              Pick a token on the left, tune with the sliders. Preview is live.
            </div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
            {/* Theme toggle */}
            <div style={{
              display:"inline-flex", border:"1px solid var(--line)", borderRadius:3,
              padding:2, gap:2,
            }}>
              {["dark","light"].map(t => {
                const active = (accents._theme || "dark") === t;
                return (
                  <button key={t}
                    onClick={() => onChange({ ...accents, _theme: t })}
                    style={{
                      background: active ? "var(--line-soft)" : "transparent",
                      color: active ? "var(--text)" : "var(--text-dim)",
                      border:"none", borderRadius:2,
                      padding:"4px 10px", cursor:"pointer",
                      fontSize:9, fontFamily:"monospace", letterSpacing:"0.08em",
                      textTransform:"uppercase",
                    }}
                  >{t}</button>
                );
              })}
            </div>
            <button onClick={handleCancel} style={{
              background:"transparent", border:"1px solid var(--line)",
              color:"var(--text-dim)", borderRadius:3, padding:"4px 10px", cursor:"pointer",
              fontSize:11, fontFamily:"monospace", lineHeight:1,
            }}>✕</button>
          </div>
        </div>

        <div style={{ display:"flex", gap:18, alignItems:"flex-start" }}>
          {/* Token list */}
          <div style={{
            flex:"0 0 220px", maxHeight:520, overflowY:"auto",
            border:"1px solid var(--line-soft)", borderRadius:4, padding:4,
            background:"var(--surface)",
          }}>
            {TOKEN_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom:6 }}>
                <div style={{
                  fontSize:8, color:"var(--text-dim3)", letterSpacing:"0.12em",
                  textTransform:"uppercase", padding:"6px 8px 4px",
                }}>{group.label}</div>
                {group.keys.map(key => {
                  const isActive = key === active;
                  const c = accents[key] || DEFAULT_ACCENTS[key];
                  return (
                    <button key={key} onClick={() => setActive(key)} style={{
                      display:"flex", alignItems:"center", gap:9, width:"100%",
                      background: isActive ? "var(--line-soft)" : "transparent",
                      border:"none", padding:"5px 8px", borderRadius:3, cursor:"pointer",
                      textAlign:"left",
                    }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--line-soft)"; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{
                        width:14, height:14, borderRadius:"50%",
                        background: oklchString(c),
                        border:"1px solid color-mix(in oklch, var(--text-dim) 30%, transparent)",
                        flexShrink:0,
                      }} />
                      <span style={{
                        fontSize:10, color: isActive ? "var(--text)" : "var(--text-dim)",
                        fontFamily:"monospace", letterSpacing:"0.04em",
                      }}>{TOKEN_LABELS[key]}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Editor */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{
              padding:"12px 14px", background:"var(--surface)",
              border:"1px solid var(--line-soft)", borderRadius:4,
              marginBottom:12,
            }}>
              <div style={{
                fontSize:8, color:"var(--text-dim3)", letterSpacing:"0.12em",
                textTransform:"uppercase", marginBottom:6,
              }}>Editing</div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <span style={{
                  width:32, height:32, borderRadius:6,
                  background: oklchString(current),
                  border:"1px solid var(--line)",
                  flexShrink:0,
                }} />
                <div>
                  <div style={{ fontSize:13, color:"var(--text)", fontWeight:700 }}>{TOKEN_LABELS[active]}</div>
                  <div style={{ fontSize:9, color:"var(--text-dim2)", fontFamily:"monospace" }}>
                    {oklchString(current)}
                  </div>
                </div>
                <button onClick={resetToken} disabled={isDefault} style={{
                  marginLeft:"auto",
                  background:"transparent", border:"1px solid var(--line)",
                  color: isDefault ? "var(--text-dim3)" : "var(--text-dim)",
                  borderRadius:3, padding:"4px 9px",
                  cursor: isDefault ? "not-allowed" : "pointer",
                  fontSize:9, fontFamily:"monospace", letterSpacing:"0.06em",
                  textTransform:"uppercase",
                }}>↺ Reset</button>
              </div>

              <Slider label="Hue"       min={0}   max={360}  step={1}     value={current.h} onChange={v => updateActive({ h: v })} />
              <Slider label="Chroma"    min={0}   max={0.4}  step={0.005} value={current.c} onChange={v => updateActive({ c: v })} />
              <Slider label="Lightness" min={0}   max={1}    step={0.005} value={current.l} onChange={v => updateActive({ l: v })} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop:14, paddingTop:12, borderTop:"1px solid var(--line-soft)",
          display:"flex", alignItems:"center", gap:10, flexWrap:"wrap",
        }}>
          <button onClick={onResetAll} style={{
            background:"transparent", border:"1px solid var(--line)", color:"var(--text-dim)",
            borderRadius:3, padding:"6px 14px", cursor:"pointer",
            fontSize:10, fontFamily:"monospace",
            letterSpacing:"0.08em", textTransform:"uppercase",
          }}>↺ Reset all</button>
          <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
            {savedFlash && (
              <span style={{ fontSize:10, color:"var(--ok)", fontFamily:"monospace", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                ✓ Saved
              </span>
            )}
            <button onClick={handleCancel} style={{
              background:"transparent", border:"1px solid var(--line)", color:"var(--text-dim)",
              borderRadius:3, padding:"6px 14px", cursor:"pointer",
              fontSize:10, fontFamily:"monospace", letterSpacing:"0.08em", textTransform:"uppercase",
            }}>Cancel</button>
            <button onClick={onSave} style={{
              background:"var(--ok)", color:"#080807", border:"none",
              borderRadius:3, padding:"7px 18px", cursor:"pointer",
              fontSize:11, fontWeight:700, fontFamily:"monospace",
              letterSpacing:"0.1em", textTransform:"uppercase",
            }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
