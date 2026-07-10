import { describe, expect, it } from "vitest";
import { EXAMPLES, EXAMPLES_BY_PROGRAM, extractPlaceholders, hydrateExample } from "../data/examples";
import { PROFILE_DOC_KEYS } from "../data/profile";
import { PROGRAMS } from "../data/programs";

const PROGRAM_IDS = new Set(PROGRAMS.map((p) => p.id));
const PROFILE_KEYS = new Set(PROFILE_DOC_KEYS);

// Identity / secret patterns that must never appear in public examples.
const BANNED = [
  /jami[ .]?studio/i, /yrka/i, /@\w+\.\w+/,            // company identity, emails
  /\b11[A-Z]{5,}\b/,                                    // referral-code shapes
  /invoice/i, /account[_ ]?id/i, /coupon/i,
];

describe("example library", () => {
  it("ships at least the core archetypes", () => {
    expect(EXAMPLES.length).toBeGreaterThanOrEqual(8);
  });

  it("every programId keys to a real catalog program", () => {
    for (const e of EXAMPLES.filter((e) => e.programId)) {
      expect(PROGRAM_IDS.has(e.programId), `${e.id} -> ${e.programId}`).toBe(true);
    }
    expect(Object.keys(EXAMPLES_BY_PROGRAM).length).toBeGreaterThan(0);
  });

  it("all placeholders resolve to real profile schema keys", () => {
    for (const e of EXAMPLES) {
      const unknown = extractPlaceholders(e.body).filter((k) => !PROFILE_KEYS.has(k));
      expect(unknown, `${e.id} unknown placeholders`).toEqual([]);
    }
  });

  it("contains no identity, email, referral-code, or account patterns", () => {
    for (const e of EXAMPLES) {
      for (const rx of BANNED) {
        expect(rx.test(e.body), `${e.id} matched ${rx}`).toBe(false);
      }
    }
  });

  it("hydrates filled keys and leaves unfilled placeholders visible", () => {
    const body = "{{company_name}} is {{one_liner}}.";
    const out = hydrateExample(body, { company_name: "Acme", one_liner: "" });
    expect(out).toBe("Acme is {{one_liner}}.");
  });
});
