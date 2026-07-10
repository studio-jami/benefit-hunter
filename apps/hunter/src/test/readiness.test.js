import { describe, expect, it } from "vitest";
import { getApplicationReadiness, DEFAULT_PROFILE_DOC, PROFILE_DOC_KEYS } from "../data/profile";

const program = (fields) => ({ formConfig: { platform: "custom", fields } });

describe("getApplicationReadiness", () => {
  it("returns none for programs without form fields", () => {
    expect(getApplicationReadiness(program([]), {}).status).toBe("none");
  });

  it("returns empty when nothing is filled", () => {
    const r = getApplicationReadiness(program(["company_name", "website"]), DEFAULT_PROFILE_DOC);
    expect(r.status).toBe("empty");
    expect(r.missing).toEqual(["company_name", "website"]);
  });

  it("returns partial with correct counts", () => {
    const doc = { ...DEFAULT_PROFILE_DOC, company_name: "Acme" };
    const r = getApplicationReadiness(program(["company_name", "website"]), doc);
    expect(r.status).toBe("partial");
    expect(r.filled).toBe(1);
    expect(r.needed).toBe(2);
  });

  it("returns ready (fill & review) when all fields are answered", () => {
    const doc = { ...DEFAULT_PROFILE_DOC, company_name: "Acme", website: "https://acme.test" };
    expect(getApplicationReadiness(program(["company_name", "website"]), doc).status).toBe("ready");
  });

  it("treats whitespace-only values as missing", () => {
    const doc = { ...DEFAULT_PROFILE_DOC, company_name: "   " };
    expect(getApplicationReadiness(program(["company_name"]), doc).status).toBe("empty");
  });

  it("profile schema has no duplicate keys", () => {
    expect(new Set(PROFILE_DOC_KEYS).size).toBe(PROFILE_DOC_KEYS.length);
  });
});
