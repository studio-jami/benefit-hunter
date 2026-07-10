import { useMemo } from "react";
import { awardTotals, groupAwardsByLane, REAL_AWARDS, REAL_AWARDS_SOURCE_DATE } from "../data/realAwards";
import { LANE_COLORS } from "../data/lanes";

const fmt = (n) => "$" + n.toLocaleString();

function AwardRow({ award }) {
  const unverified = award.verificationStatus === "unverified-claimed";
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap",
      padding: "7px 10px", borderBottom: "1px dashed var(--line-soft)",
      opacity: unverified ? 0.75 : 1,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", minWidth: 140 }}>
        {award.vendor}
      </span>
      <span style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "monospace" }}>
        {award.value.label}
      </span>
      {award.term && (
        <span style={{ fontSize: 9, color: "var(--text-dim3)", fontFamily: "monospace" }}>{award.term}</span>
      )}
      {award.value.cashLike && award.value.estimate != null && (
        <span style={{ fontSize: 9, color: "var(--gold)", fontFamily: "monospace" }}>cash-like</span>
      )}
      {award.programId && (
        <span style={{ fontSize: 9, color: "var(--info)", fontFamily: "monospace" }}>
          ↳ in catalog: {award.programId}
        </span>
      )}
      <span style={{
        marginLeft: "auto", fontSize: 11, fontFamily: "monospace",
        color: award.value.estimate != null ? "var(--text)" : "var(--text-dim3)",
      }}>
        {award.value.estimate != null ? fmt(award.value.estimate) : "uncounted"}
      </span>
    </div>
  );
}

// Real-dollars-by-stack proof view. Confirmed vs unverified-claimed rendered
// separately; totals reconcile against realAwards.js; freshness = the dated
// active-credits source.
export function ProofView() {
  const totals = useMemo(() => awardTotals(), []);
  const official = REAL_AWARDS.filter((a) => a.verificationStatus === "official");
  const unverified = REAL_AWARDS.filter((a) => a.verificationStatus === "unverified-claimed");
  const byLane = useMemo(() => groupAwardsByLane(official), [official]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 880, margin: "0 auto" }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "0.02em" }}>
          Real dollars, by stack
        </div>
        <div style={{ fontSize: 10, color: "var(--text-dim2)", marginTop: 4, lineHeight: 1.7, maxWidth: 680 }}>
          What Jami Studio actually secured with this playbook — itemized, de-identified, and honest
          about verification. Dollar figures are award values or public list prices verified on the
          source date; plans with custom pricing are listed but left uncounted rather than guessed.
        </div>
      </div>

      {/* Totals strip */}
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 4 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gold)", fontFamily: "monospace" }}>{fmt(totals.confirmedCash)}</div>
          <div style={{ fontSize: 8, color: "var(--text-dim2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>confirmed cash-like credits</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", fontFamily: "monospace" }}>{fmt(totals.confirmedInKind)}</div>
          <div style={{ fontSize: 8, color: "var(--text-dim2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>confirmed plans &amp; discounts</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-dim)", fontFamily: "monospace" }}>{fmt(totals.confirmedTotal)}</div>
          <div style={{ fontSize: 8, color: "var(--text-dim2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>confirmed total</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "monospace" }}>as of {REAL_AWARDS_SOURCE_DATE}</div>
          <div style={{ fontSize: 8, color: "var(--text-dim3)", marginTop: 2 }}>
            +{totals.uncountedVendors.length} awards uncounted (no public list price)
          </div>
        </div>
      </div>

      {/* Lanes */}
      {Object.entries(byLane).map(([lane, awards]) => {
        const laneTotal = awards.reduce((s, a) => s + (a.value.estimate ?? 0), 0);
        const tone = LANE_COLORS[lane]?.tone;
        return (
          <div key={lane}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                color: tone ? `var(--${tone})` : "var(--text)",
              }}>{lane}</span>
              <span style={{ fontSize: 9, color: "var(--text-dim3)", fontFamily: "monospace" }}>{awards.length} awards</span>
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-dim)", fontFamily: "monospace" }}>{fmt(laneTotal)}</span>
            </div>
            <div style={{ border: "1px solid var(--line-soft)", borderRadius: 4 }}>
              {awards.map((a) => <AwardRow key={a.vendor + a.value.label} award={a} />)}
            </div>
          </div>
        );
      })}

      {/* Unverified corral */}
      {unverified.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--wait)" }}>
              Unverified — claimed
            </span>
            {totals.unverifiedTotal > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--wait)", fontFamily: "monospace" }}>{fmt(totals.unverifiedTotal)}</span>
            )}
          </div>
          <div style={{ fontSize: 9, color: "var(--text-dim2)", marginBottom: 8, lineHeight: 1.6, maxWidth: 680 }}>
            Previously tracked or claimed, but not confirmed in the latest verification pass.
            Kept for honesty — never counted as confirmed live value, never silently dropped.
          </div>
          <div style={{ border: "1px dashed var(--line)", borderRadius: 4 }}>
            {unverified.map((a) => <AwardRow key={a.vendor + a.value.label} award={a} />)}
          </div>
        </div>
      )}

      <div style={{ fontSize: 9, color: "var(--text-dim3)", lineHeight: 1.7 }}>
        Notes: {official.filter(a => a.notes).length} awards carry sourcing notes in the public artifact
        (apps/hunter/src/data/realAwards.js). No redemption links, codes, or account identifiers are published.
      </div>
    </div>
  );
}
