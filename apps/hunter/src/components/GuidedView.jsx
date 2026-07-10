import { useMemo, useState } from "react";
import { EXAMPLES_BY_PROGRAM } from "../data/examples";
import { getApplicationReadiness } from "../data/profile";
import { applyState, groupByStrategyTier, orderGuided, STRATEGY_TIERS } from "../lib/guidedFlow";
import { ProgramCard } from "./ProgramCard";
import { ExampleModal } from "./ExampleModal";

// Guided umbrella-first flow: tiers T0 -> T3 with apply-now/apply-after
// states, per-program readiness ("ready to fill & review" — never
// auto-submit), and example links. Presentation layer only; no backend.
export function GuidedView({ programs, statuses, onStatusChange, profileMatchSet, profileDoc, onVendorClick }) {
  const [openExample, setOpenExample] = useState(null);

  const grouped = useMemo(() => {
    const ordered = orderGuided(programs, statuses);
    return groupByStrategyTier(ordered);
  }, [programs, statuses]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div style={{
        border: "1px solid var(--line)", borderRadius: 4, padding: "10px 14px",
        fontSize: 10, lineHeight: 1.7, color: "var(--text-dim)", fontFamily: "monospace",
      }}>
        <span style={{ color: "var(--gold)", fontWeight: 700, letterSpacing: "0.08em" }}>ORDER OF OPERATIONS →</span>{" "}
        Exhaust umbrella packs and referral hubs before burning one-off solo lanes —
        each acceptance becomes proof on the next application. This tool preps
        applications for you to <span style={{ color: "var(--text)" }}>fill &amp; review</span>; it never auto-submits.
      </div>

      {STRATEGY_TIERS.map((tier) => {
        const list = grouped.get(tier.key) || [];
        if (list.length === 0) return null;
        return (
          <div key={tier.key}>
            <div style={{ marginBottom: 4, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", letterSpacing: "0.02em" }}>
                {tier.name}
              </span>
              <span style={{ fontSize: 9, color: "var(--text-dim3)", fontFamily: "monospace" }}>
                {list.length} programs
              </span>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-dim2)", marginBottom: 10, maxWidth: 720, lineHeight: 1.6 }}>
              {tier.blurb}
            </div>
            <div className="card-grid">
              {list.map((p) => {
                const st = applyState(p, statuses);
                const r = getApplicationReadiness(p, profileDoc || {});
                const example = EXAMPLES_BY_PROGRAM[p.id];
                return (
                  <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    <div style={{
                      display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap",
                      padding: "4px 2px 6px", fontSize: 9, fontFamily: "monospace",
                    }}>
                      <span style={{
                        color: st.key === "now" ? "var(--ok)" : st.key === "after" ? "var(--wait)" : "var(--info)",
                        fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                      }}>
                        {st.label}
                      </span>
                      {r.status === "ready" && r.needed > 0 && (
                        <span style={{ color: "var(--match)" }}>· ready to fill &amp; review</span>
                      )}
                      {r.status === "partial" && (
                        <span style={{ color: "var(--text-dim2)" }}>· profile {r.filled}/{r.needed}</span>
                      )}
                      {example && (
                        <button onClick={() => setOpenExample(example)} style={{
                          marginLeft: "auto", background: "transparent",
                          border: "1px solid color-mix(in oklch, var(--info) 40%, transparent)",
                          color: "var(--info)", borderRadius: 3, padding: "2px 8px",
                          cursor: "pointer", fontSize: 9, fontFamily: "monospace", letterSpacing: "0.05em",
                        }}>
                          ▤ example
                        </button>
                      )}
                    </div>
                    <ProgramCard
                      program={p}
                      status={statuses[p.id] || "not_applied"}
                      onStatusChange={onStatusChange}
                      profileMatch={profileMatchSet.has(p.id)}
                      onVendorClick={onVendorClick}
                      profileDoc={profileDoc}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {openExample && (
        <ExampleModal example={openExample} profileDoc={profileDoc} onClose={() => setOpenExample(null)} />
      )}
    </div>
  );
}
