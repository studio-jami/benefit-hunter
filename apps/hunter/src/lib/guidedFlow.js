// Guided umbrella-first flow — strategy tiering, ordering, and apply-state.
// Mirrors the operating strategy in docs/product/setup-kit-and-guided-flow.md:
//   T0 umbrella packs -> T1 referral hubs -> T2 direct solo -> T3 inventory.
// Rule surfaced to the user: exhaust umbrella and referral-hub applications
// before burning one-off solo lanes reachable through a pack or partner.

// Referral hubs: programs other vendors recognize; citing them on direct
// applications reaches partner-tier benefits.
export const REFERRAL_HUB_IDS = new Set([
  "github-startups",
  "amplitude-startups",
  "intercom-earlystage",
]);

export const STRATEGY_TIERS = [
  { key: 0, name: "T0 — Umbrella packs",
    blurb: "Multi-vendor packs. One acceptance unlocks dozens of partner offers and becomes proof on later applications. Redeem partners within the pack window." },
  { key: 1, name: "T1 — Referral hubs",
    blurb: "Programs other vendors recognize. Cite them on direct applications to reach partner-tier benefits." },
  { key: 2, name: "T2 — Direct programs",
    blurb: "Single-vendor credits and discounts. Apply after T0/T1, using any partner affiliation you now hold." },
  { key: 3, name: "T3 — Inventory",
    blurb: "Free tiers, downloads, personal subs, and expiring trials. Grab when needed; do not design a stack around them." },
];

// Program types that involve a real application worth sequencing.
const APPLICATION_TYPES = new Set(["Credits", "Credits + Software", "Program", "Discount", "License", "Database"]);

export function strategyTier(p) {
  if (p.type === "Bundle") return 0;
  if (REFERRAL_HUB_IDS.has(p.id)) return 1;
  if (p.tags.includes("stale")) return 3;
  if (p.type === "Trial" || p.tags.includes("expiry_short") || p.tags.includes("one_time_purchase")) return 3;
  const needsApplication =
    APPLICATION_TYPES.has(p.type) &&
    (p.tags.includes("human_review") ||
      p.tags.includes("partner_required") ||
      p.tags.includes("proposal_required") ||
      (p.formConfig && p.formConfig.fields && p.formConfig.fields.length > 0) ||
      !p.access.includes("anyone"));
  return needsApplication ? 2 : 3;
}

// Apply-now / apply-after state from dependencies and referral leverage.
export function applyState(p, statuses = {}) {
  const deps = p.dependencies || [];
  const blockedBy = deps.filter((d) => (statuses[d] || "not_applied") !== "approved");
  if (blockedBy.length > 0) {
    return { key: "after", label: "apply after: " + blockedBy.join(", "), blockedBy };
  }
  if (strategyTier(p) === 2 && p.tags.includes("partner_required")) {
    return { key: "leverage", label: "stronger with T0/T1 proof", blockedBy: [] };
  }
  return { key: "now", label: "apply now", blockedBy: [] };
}

// Order a program list into the guided sequence: tier asc, then apply-now
// before blocked, then value desc.
export function orderGuided(programs, statuses = {}) {
  const stateRank = { now: 0, leverage: 1, after: 2 };
  return [...programs].sort((a, b) => {
    const t = strategyTier(a) - strategyTier(b);
    if (t !== 0) return t;
    const s = stateRank[applyState(a, statuses).key] - stateRank[applyState(b, statuses).key];
    if (s !== 0) return s;
    return b.value.estimate - a.value.estimate;
  });
}

export function groupByStrategyTier(programs) {
  const groups = new Map(STRATEGY_TIERS.map((t) => [t.key, []]));
  for (const p of programs) groups.get(strategyTier(p)).push(p);
  return groups;
}
