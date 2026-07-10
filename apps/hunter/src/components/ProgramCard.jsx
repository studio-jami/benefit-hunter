import { useState } from "react";
import { LANE_COLORS } from "../data/lanes";
import { STATUS_CONFIG } from "../data/statuses";
import { agentState, getAgentTask } from "../lib/agent";
import { getApplicationReadiness, getFieldMeta } from "../data/profile";
import { toneStyle } from "../lib/tone";
import { Badge } from "./Badge";
import { AccessBadge } from "./AccessBadge";

// Cascaded primary status chip — collapses 4 signals (agent state, readiness,
// for-you match, risk) into one. Risk wins, then submit/draft/research.
function statusChip({ program, profileDoc }) {
  const isStale = program.tags.includes("stale");
  const hasBillingRisk = program.tags.includes("billing_risk");

  if (hasBillingRisk) return { label: "Billing Risk", tone: "stop" };
  if (isStale)        return { label: "Verify First", tone: "wait" };

  const ag = agentState(program);
  const r  = getApplicationReadiness(program, profileDoc || {});
  const suffix = r.status === "none" || r.status === "ready" ? "" : ` · ${r.filled}/${r.needed}`;
  return { label: ag.label + suffix, tone: ag.tone };
}

export function ProgramCard({ program, status, onStatusChange, profileMatch, onVendorClick, profileDoc }) {
  const [botOpen, setBotOpen] = useState(false);
  const lc = LANE_COLORS[program.lane];
  const sc = STATUS_CONFIG[status];
  const ag = agentState(program);
  const hasBillingRisk = program.tags.includes("billing_risk");
  const isStale = program.tags.includes("stale");
  const hasDeps = program.dependencies && program.dependencies.length > 0;
  const dimmed = !profileMatch;
  const chip = statusChip({ program, profileDoc });
  const chipStyle = toneStyle(chip.tone);
  const laneTone = lc?.tone;

  // Access badges shown inline; "ANY" carries no info, hide it.
  const accessVisible = program.access.filter(a => a !== "ANY");

  // Vendor favicon — derive from apply URL.
  const vendorDomain = (() => {
    try { return new URL(program.urls.apply).hostname.replace(/^www\./, ""); }
    catch { return null; }
  })();

  return (
    <div style={{
      position: "relative",
      background: "var(--surface)",
      border: "1px solid " + (
        hasBillingRisk ? "color-mix(in oklch, var(--stop) 32%, transparent)" :
        isStale        ? "var(--line)" :
        `color-mix(in oklch, var(--${laneTone}) 24%, transparent)`
      ),
      borderRadius:4, padding:"16px 16px 14px",
      display:"flex", flexDirection:"column", gap:11,
      opacity: status === "skip" ? 0.3 : isStale ? 0.55 : dimmed ? 0.4 : 1,
      transition:"opacity 0.2s",
      minHeight: 0,
    }}>

      {/* Vendor favicon — top-right, clean, low-key */}
      {vendorDomain && (
        <img
          src={`https://www.google.com/s2/favicons?domain=${vendorDomain}&sz=64`}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          style={{
            position:"absolute", top:12, right:12,
            width:28, height:28, borderRadius:4,
            opacity:0.45, filter:"saturate(0.7)",
            pointerEvents:"none",
          }}
        />
      )}

      {/* ROW 1 — Identity: Tier · Lane · Vendor (right side reserved for favicon) */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, alignItems:"center", paddingRight: vendorDomain ? 36 : 0 }}>
        <Badge
          label={"T" + program.tier + " " + (program.tier===1?"FREE":"DISC")}
          tone={program.tier===1 ? "accent" : null}
        />
        <Badge label={program.lane} tone={laneTone} />
        <span
          onClick={(e) => { e.stopPropagation(); onVendorClick && onVendorClick(program.vendor); }}
          style={{
            fontSize:8, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase",
            color:"var(--text-dim)", background:"transparent", border:"1px solid var(--line)",
            padding:"2px 6px", borderRadius:2, whiteSpace:"nowrap",
            cursor: onVendorClick ? "pointer" : "default",
            transition:"color 0.15s, border-color 0.15s",
          }}
          title={onVendorClick ? "Click to filter by this vendor" : ""}
          onMouseEnter={(e) => { if (onVendorClick) { e.currentTarget.style.color = "var(--info)"; e.currentTarget.style.borderColor = "color-mix(in oklch, var(--info) 33%, transparent)"; }}}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.borderColor = "var(--line)"; }}
        >@{program.vendor}</span>
      </div>

      {/* ROW 2 — Eligibility (access) + single status chip — under identity, above title */}
      <div style={{ display:"flex", gap:5, alignItems:"center", flexWrap:"wrap" }}>
        {accessVisible.map(a => <AccessBadge key={a} accessKey={a} />)}
        <span style={{
          fontSize:8, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
          color: chipStyle.color, background: chipStyle.bg, border: "1px solid " + chipStyle.border,
          padding:"3px 7px", borderRadius:3, marginLeft: accessVisible.length ? 2 : 0,
        }}>
          {chip.label}
        </span>
      </div>

      {/* ROW 3 — Name (strip parenthetical suffixes for cleaner reads) */}
      <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", letterSpacing:"-0.01em", lineHeight:1.3 }}>
        {program.name.replace(/\s*\([^)]*\)\s*$/, "")}
      </div>

      {/* ROW 4 — Summary */}
      <div style={{ fontSize:11, color:"var(--text-dim)", lineHeight:1.55 }}>
        {program.description}
      </div>

      {/* Dependencies (if any) */}
      {hasDeps && (
        <div style={{ fontSize:9, color:"var(--info)", fontFamily:"monospace" }}>
          ↳ depends on: {program.dependencies.join(", ")}
        </div>
      )}

      {/* ROW 5 — Actions — pinned to bottom */}
      <div style={{ display:"flex", gap:7, alignItems:"center", marginTop:"auto", paddingTop:4 }}>
        <a href={program.urls.apply} target="_blank" rel="noopener noreferrer" style={{
          fontSize:9, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
          color:"#080807", background:"var(--neutral-action)",
          padding:"5px 11px", borderRadius:3, textDecoration:"none", flexShrink:0,
        }}>Apply →</a>
        {(() => {
          const ss = toneStyle(sc.tone);
          return (
            <select value={status} onChange={e => onStatusChange(program.id, e.target.value)} style={{
              flex:1, fontSize:10, fontWeight:600,
              background: status === "not_applied" ? "var(--surface-2)" : ss.bg,
              color: ss.color,
              border: "1px solid " + (status === "not_applied" ? "var(--line)" : "transparent"),
              borderRadius:3, padding:"4px 7px",
              appearance:"none", cursor:"pointer", fontFamily:"monospace", outline:"none",
            }}>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k} style={{ background:"var(--line-soft)" }}>{v.label}</option>
              ))}
            </select>
          );
        })()}
        <button onClick={() => setBotOpen(o => !o)} style={{
          background:"transparent", border:"1px solid var(--line)", color:"var(--text-dim3)",
          borderRadius:3, padding:"4px 8px", cursor:"pointer", fontSize:9,
          fontFamily:"monospace", letterSpacing:"0.06em", flexShrink:0,
        }}>{botOpen ? "cfg ▲" : "cfg ▼"}</button>
      </div>

      {/* BOT CONFIG PANEL — contains all demoted detail: type, task, tags, eligibility, fields */}
      {botOpen && (
        <div style={{
          background:"var(--surface-2)", borderTop:"1px solid var(--line-soft)",
          margin:"4px -15px -14px", padding:"10px 15px",
          borderRadius:"0 0 4px 4px",
          fontFamily:"monospace", fontSize:9, lineHeight:1.7,
        }}>
          <div style={{ color:"var(--text-dim)", fontWeight:700, marginBottom:4, letterSpacing:"0.08em" }}>// AGENT CONFIG</div>
          <div><span style={{ color:"var(--text-dim2)" }}>state</span><span style={{ color:"var(--text-dim3)" }}> → </span><span style={{ color: `var(--${ag.tone})` }}>{ag.label.toLowerCase()}</span></div>
          <div><span style={{ color:"var(--text-dim2)" }}>task</span><span style={{ color:"var(--text-dim3)" }}> → </span><span style={{ color:"var(--text-dim)" }}>{getAgentTask(program).label.toLowerCase()}</span></div>
          <div><span style={{ color:"var(--text-dim2)" }}>type</span><span style={{ color:"var(--text-dim3)" }}> → </span><span style={{ color:"var(--text-dim)" }}>{program.type}</span></div>
          <div><span style={{ color:"var(--text-dim2)" }}>platform</span><span style={{ color:"var(--text-dim3)" }}> → </span><span style={{ color:"var(--text-dim)" }}>{program.formConfig.platform}</span></div>
          <div><span style={{ color:"var(--text-dim2)" }}>fields</span><span style={{ color:"var(--text-dim3)" }}> → </span><span style={{ color:"var(--text)" }}>{program.formConfig.fields.length > 0 ? program.formConfig.fields.join(", ") : "standard email signup"}</span></div>
          <div style={{ marginTop:6, paddingTop:6, borderTop:"1px dashed var(--line)" }}>
            <span style={{ color:"var(--text-dim2)" }}>access</span><span style={{ color:"var(--text-dim3)" }}> → </span><span style={{ color:"var(--text-dim)" }}>{program.access.join(" OR ")}</span>
          </div>
          <div><span style={{ color:"var(--text-dim2)" }}>tags</span><span style={{ color:"var(--text-dim3)" }}> → </span><span style={{ color:"var(--text-dim)" }}>{program.tags.join(" | ") || "—"}</span></div>
          <div style={{ marginTop:6, paddingTop:6, borderTop:"1px dashed var(--line)" }}>
            <span style={{ color:"var(--text-dim2)" }}>eligible</span><span style={{ color:"var(--text-dim3)" }}> → </span><span style={{ color:"var(--text-dim)", fontFamily:"inherit" }}>{program.eligibility}</span>
          </div>
          <div style={{ marginTop:6, paddingTop:6, borderTop:"1px dashed var(--line)" }}>
            <span style={{ color:"var(--gold)" }}>value</span><span style={{ color:"var(--text-dim3)" }}> → </span><span style={{ color:"var(--text-dim)" }}>${program.value.estimate.toLocaleString()} · {program.value.cashLike ? "cash-like" : "in-kind"} · {program.value.counted ? "counted" : "uncounted"}</span>
          </div>
          <div><span style={{ color:"var(--text-dim2)" }}>verified</span><span style={{ color:"var(--text-dim3)" }}> → </span><span style={{ color:"var(--text-dim)" }}>{program.lastVerified}</span></div>
          <div style={{ marginTop:4 }}><span style={{ color:"var(--text-dim2)" }}>url</span><span style={{ color:"var(--text-dim3)" }}> → </span><span style={{ color:"var(--text-dim)", wordBreak:"break-all" }}>{program.urls.apply}</span></div>
          {program.formConfig.fields && program.formConfig.fields.length > 0 && (
            <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid var(--line-soft)" }}>
              <div style={{ color:"var(--text-dim)", fontWeight:700, marginBottom:5, letterSpacing:"0.08em" }}>// APPLICATION DATA</div>
              {program.formConfig.fields.map(k => {
                const v = (profileDoc || {})[k];
                const ok = v && String(v).trim();
                const meta = getFieldMeta(k);
                return (
                  <div key={k} style={{ display:"flex", gap:6, fontSize:9, marginBottom:2 }}>
                    <span style={{ color: ok ? "var(--ok)" : "var(--stop)", width:10, flexShrink:0 }}>{ok ? "✓" : "○"}</span>
                    <span style={{ color:"var(--text-dim)", minWidth:130, flexShrink:0 }}>{meta.label}</span>
                    <span style={{ color:"var(--text-dim3)", flexShrink:0 }}>→</span>
                    <span style={{
                      color: ok ? "var(--text)" : "var(--text-dim3)",
                      fontStyle: ok ? "normal" : "italic",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                    }}>{ok ? String(v).slice(0, 80) : "not filled"}</span>
                  </div>
                );
              })}
              <button onClick={(e) => {
                e.stopPropagation();
                const data = {};
                for (const k of program.formConfig.fields) data[k] = (profileDoc || {})[k] || "";
                const text = JSON.stringify(data, null, 2);
                if (navigator.clipboard) navigator.clipboard.writeText(text);
              }} style={{
                marginTop:6, background:"transparent", border:"1px solid var(--line)", color:"var(--text-dim)",
                padding:"3px 10px", borderRadius:2, cursor:"pointer", fontSize:9,
                fontFamily:"monospace", letterSpacing:"0.05em",
              }}>
                Copy as JSON
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
