import { describe, expect, it } from "vitest";
import { PROGRAMS } from "../data/programs";
import { applyState, orderGuided, strategyTier, groupByStrategyTier } from "../lib/guidedFlow";

const byId = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));

describe("strategyTier", () => {
  it("puts umbrella bundles in T0", () => {
    expect(strategyTier(byId["aws-activate-catalog"])).toBe(0);
    expect(strategyTier(byId["brex-partner-perks"])).toBe(0);
  });

  it("puts referral hubs in T1", () => {
    expect(strategyTier(byId["github-startups"])).toBe(1);
    expect(strategyTier(byId["amplitude-startups"])).toBe(1);
  });

  it("puts direct application programs in T2", () => {
    expect(strategyTier(byId["cloudflare-startups"])).toBe(2);
    expect(strategyTier(byId["posthog-startups"])).toBe(2);
    expect(strategyTier(byId["algolia-startups"])).toBe(2);
  });

  it("puts free tiers, trials, and stale programs in T3", () => {
    expect(strategyTier(byId["cloudflare-free"])).toBe(3);
    expect(strategyTier(byId["adobe-trial"])).toBe(3);
    expect(strategyTier(byId["planetscale-hobby"])).toBe(3); // stale
  });

  it("assigns every program exactly one tier 0-3", () => {
    for (const p of PROGRAMS) {
      const t = strategyTier(p);
      expect([0, 1, 2, 3]).toContain(t);
    }
  });
});

describe("applyState (dependency gating)", () => {
  it("blocks dependent programs until the dependency is approved", () => {
    const p = byId["aws-activate-catalog"]; // depends on aws-founders
    expect(applyState(p, {}).key).toBe("after");
    expect(applyState(p, { "aws-founders": "applied" }).key).toBe("after");
    expect(applyState(p, { "aws-founders": "approved" }).key).toBe("now");
  });

  it("flags partner-required T2 programs as leverage plays", () => {
    expect(applyState(byId["algolia-startups"], {}).key).toBe("leverage");
  });

  it("marks dependency-free programs apply-now", () => {
    expect(applyState(byId["cloudflare-startups"], {}).key).toBe("now");
  });
});

describe("orderGuided", () => {
  it("orders tiers ascending T0 -> T3", () => {
    const ordered = orderGuided(PROGRAMS, {});
    const tiers = ordered.map((p) => strategyTier(p));
    for (let i = 1; i < tiers.length; i++) expect(tiers[i]).toBeGreaterThanOrEqual(tiers[i - 1]);
  });

  it("groups cover all programs with none lost", () => {
    const groups = groupByStrategyTier(PROGRAMS);
    const total = [...groups.values()].reduce((s, l) => s + l.length, 0);
    expect(total).toBe(PROGRAMS.length);
  });
});
