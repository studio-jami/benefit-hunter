import { describe, expect, it } from "vitest";
import { awardTotals, groupAwardsByLane, REAL_AWARDS, REAL_AWARDS_SOURCE_DATE } from "../data/realAwards";
import { LANE_COLORS } from "../data/lanes";
import { PROGRAMS } from "../data/programs";

const PROGRAM_IDS = new Set(PROGRAMS.map((p) => p.id));

// De-identification: no redemption links, codes, invoice/account IDs.
const BANNED = [/https?:\/\//i, /coupon/i, /invoice/i, /account[_ ]?id/i, /\b11[A-Z]{5,}\b/, /@\w+\.\w+/];

describe("real awards artifact", () => {
  it("has a dated source and every record cites it", () => {
    expect(REAL_AWARDS_SOURCE_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const a of REAL_AWARDS) expect(a.source).toContain("active-credits");
  });

  it("uses only valid verification statuses", () => {
    for (const a of REAL_AWARDS) {
      expect(["official", "unverified-claimed"]).toContain(a.verificationStatus);
    }
  });

  it("joins to real catalog programs where linked", () => {
    for (const a of REAL_AWARDS.filter((a) => a.programId)) {
      expect(PROGRAM_IDS.has(a.programId), `${a.vendor} -> ${a.programId}`).toBe(true);
    }
  });

  it("maps every award to a known lane", () => {
    const lanes = new Set(Object.keys(LANE_COLORS));
    for (const a of REAL_AWARDS) expect(lanes.has(a.lane), `${a.vendor} lane ${a.lane}`).toBe(true);
  });

  it("contains no links, codes, or account identifiers", () => {
    for (const a of REAL_AWARDS) {
      const text = `${a.vendor} ${a.value.label} ${a.notes || ""}`;
      for (const rx of BANNED) expect(rx.test(text), `${a.vendor} matched ${rx}`).toBe(false);
    }
  });

  it("totals reconcile: cash + in-kind = confirmed, groups cover all awards", () => {
    const t = awardTotals();
    expect(t.confirmedCash + t.confirmedInKind).toBe(t.confirmedTotal);
    expect(t.confirmedTotal).toBeGreaterThan(0);

    const manualConfirmed = REAL_AWARDS
      .filter((a) => a.verificationStatus === "official" && a.value.estimate != null)
      .reduce((s, a) => s + a.value.estimate, 0);
    expect(t.confirmedTotal).toBe(manualConfirmed);

    const grouped = groupAwardsByLane();
    const count = Object.values(grouped).reduce((s, l) => s + l.length, 0);
    expect(count).toBe(REAL_AWARDS.length);
  });

  it("uncounted awards carry an explanatory note", () => {
    for (const a of REAL_AWARDS.filter((a) => a.value.estimate == null)) {
      expect((a.notes || "").length, `${a.vendor} needs a note`).toBeGreaterThan(0);
    }
  });
});
