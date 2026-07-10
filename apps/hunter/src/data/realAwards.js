// Real awards secured by Jami Studio — generated from the private, dated
// `active-credits` source (see docs/architecture/data-and-truth-model.md).
// De-identified: no redemption links, codes, invoice IDs, account IDs, or PII.
//
// Verification statuses:
//   "official"           — confirmed in the latest active-credits pass.
//   "unverified-claimed" — previously tracked/claimed but not confirmed in the
//                          latest pass; retained, never silently dropped.
//
// Value rules (no guessing):
//   - Dollar-credit awards use the value stated in active-credits.
//   - Plan awards use the vendor's PUBLIC list price, verified on the vendor
//     pricing page on SOURCE_DATE, at the smallest honest basis (1 seat).
//   - Plans with custom/unpublished pricing carry estimate: null and are
//     EXCLUDED from totals rather than estimated.

export const REAL_AWARDS_SOURCE_DATE = "2026-07-10";

export const REAL_AWARDS = [
  // ── Confirmed (official) ──────────────────────────────────────────────
  { vendor: "Cloudflare",   programId: "cloudflare-startups", lane: "DevOps",
    value: { label: "$10,000 credits", estimate: 10000, cashLike: true }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026", notes: "" },
  { vendor: "Sentry",       programId: "sentry-startups", lane: "DevOps",
    value: { label: "$5,000 credits", estimate: 5000, cashLike: true }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026", notes: "" },
  { vendor: "PostHog",      programId: "posthog-startups", lane: "DevOps",
    value: { label: "$50,000 credits", estimate: 50000, cashLike: true }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026", notes: "" },
  { vendor: "AWS",          programId: "aws-founders", lane: "DevOps",
    value: { label: "$1,300 credits", estimate: 1300, cashLike: true }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "$1k credits + $350 developer support (counted at award value $1.3k)." },
  { vendor: "GitHub",       programId: "github-startups", lane: "DevOps",
    value: { label: "$10,000 credits", estimate: 10000, cashLike: true }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "GitHub for Startups; confirmed active 2026-07-10." },
  { vendor: "Amplitude",    programId: "amplitude-startups", lane: "Business",
    value: { label: "1 yr Growth plan", estimate: 20000, cashLike: false }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Growth plan is custom-priced; program value confirmed at $20,000." },
  { vendor: "ElevenLabs",   programId: "elevenlabs-startup", lane: "Multimedia",
    value: { label: "$3,000 credits", estimate: 3000, cashLike: true }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "3.3M characters of voice generation, credited via the Fin startup pack." },
  { vendor: "Lightfield",   programId: "lightfield-perk", lane: "Business",
    value: { label: "6 mo free", estimate: 534, cashLike: false }, term: "6 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Priced at public Starter rate $89/user/mo × 6 (1 seat), lightfield.app/pricing 2026-07-10." },
  { vendor: "Stripe",       programId: "stripe-atlas-perks", lane: "Business",
    value: { label: "$500 credits", estimate: 500, cashLike: true }, term: null,
    verificationStatus: "official", source: "active-credits-07-10-2026", notes: "" },
  { vendor: "Notion",       programId: "notion-startups", lane: "Research & Writing",
    value: { label: "6 mo Business plan", estimate: 120, cashLike: false }, term: "6 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Public Business rate $20/member/mo × 6 (1 member), notion.com/pricing 2026-07-10." },
  { vendor: "Framer",       programId: "framer-startups", lane: "Multimedia",
    value: { label: "1 yr Basic plan", estimate: 120, cashLike: false }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Public Basic rate $10/mo × 12, framer.com/pricing 2026-07-10." },
  { vendor: "Linear",       programId: "linear-startup-year", lane: "DevOps",
    value: { label: "1 yr free", estimate: 120, cashLike: false }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Conservative floor at public Basic rate $10/user/mo × 12 (1 user); plan tier not recorded in source. linear.app/pricing 2026-07-10." },
  { vendor: "Depot",        programId: "depot-startup", lane: "DevOps",
    value: { label: "1 yr startup plan ($200/mo)", estimate: 2400, cashLike: true }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Rate stated in source ($200/mo)." },
  { vendor: "MongoDB",      programId: "mongodb-startups", lane: "DevOps",
    value: { label: "$5,000 credits", estimate: 5000, cashLike: true }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026", notes: "" },
  { vendor: "Algolia",      programId: "algolia-startups", lane: "DevOps",
    value: { label: "$10,000 credits", estimate: 10000, cashLike: true }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026", notes: "" },
  { vendor: "Retool",       programId: "retool-startups", lane: "Business",
    value: { label: "1 yr Business plan", estimate: 600, cashLike: false }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Public Business rate $50/builder/mo (annual) × 12 (1 builder), retool.com/pricing 2026-07-10." },
  { vendor: "Galaxy Cloud", programId: "galaxy-startup", lane: "DevOps",
    value: { label: "$600 credits", estimate: 600, cashLike: true }, term: null,
    verificationStatus: "official", source: "active-credits-07-10-2026", notes: "" },
  { vendor: "Customer.io",  programId: "customerio-startup", lane: "Business",
    value: { label: "1 yr startup plan ($200/mo)", estimate: 2400, cashLike: true }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Rate stated in source ($200/mo)." },
  { vendor: "Confluent",    programId: "confluent-startups", lane: "DevOps",
    value: { label: "$2,400 credits", estimate: 2400, cashLike: true }, term: null,
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "$400 trial + $2,000 startup credits." },
  { vendor: "Mixpanel",     programId: "mixpanel-startup", lane: "Business",
    value: { label: "1 yr Startup plan", estimate: 10000, cashLike: false }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Program value confirmed at $10,000 (vendor markets the program more broadly at $145k — 1B events, full suite; mixpanel.com/startups 2026-07-10)." },
  { vendor: "SendPulse",    programId: "sendpulse-startup", lane: "Business",
    value: { label: "$5,000 credits + 5 domains", estimate: 5000, cashLike: true }, term: null,
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Includes 5 free domains (uncounted)." },
  { vendor: "Replit",       programId: "replit-startups", lane: "DevOps",
    value: { label: "3 mo Core plan", estimate: 60, cashLike: false }, term: "3 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Public Core rate $20/mo × 3, replit.com/pricing 2026-07-10." },
  { vendor: "Bubble",       programId: "bubble-startup", lane: "DevOps",
    value: { label: "$500 credits", estimate: 500, cashLike: true }, term: null,
    verificationStatus: "official", source: "active-credits-07-10-2026", notes: "" },
  { vendor: "Miro",         programId: "miro-startup", lane: "Business",
    value: { label: "1 yr Business plan", estimate: 240, cashLike: false }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Public Business rate $20/member/mo × 12 (1 member), miro.com/pricing 2026-07-10." },
  { vendor: "Make",         programId: "make-startup", lane: "Business",
    value: { label: "1 yr Teams plan ($1,200)", estimate: 1200, cashLike: true }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Value stated in source." },
  { vendor: "Auth0",        programId: "auth0-startups", lane: "Business",
    value: { label: "1 yr B2B Professional (100k MAUs)", estimate: 8800, cashLike: false }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Conservative floor: published annual B2B Professional price at the lowest MAU tier ($8,800/yr, auth0.com/pricing 2026-07-10); the program's 100k-MAU tier is custom-priced." },
  { vendor: "Intercom",     programId: "intercom-earlystage", lane: "Business",
    value: { label: "1 yr Fin free + 93% off helpdesk", estimate: 5362, cashLike: false }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Fin component at published rates: (300 outcomes × $0.99 + 15 qualifications × $9.99) × 12 (intercom.com 2026-07-10). The 93% helpdesk discount is additional and uncounted." },
  { vendor: "Confidence (Spotify)", programId: "confidence-startups", lane: "Business",
    value: { label: "$50,000 credits", estimate: 50000, cashLike: true }, term: null,
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Value per latest active-credits truth (supersedes older pipeline figure)." },
  { vendor: "Reducto",      programId: "reducto-startups", lane: "Tech & AI",
    value: { label: "$3,000 credits", estimate: 3000, cashLike: true }, term: null,
    verificationStatus: "official", source: "active-credits-07-10-2026", notes: "" },
  { vendor: "Oro (Tomorro)", programId: "oro-tomorro", lane: "Business",
    value: { label: "$3,000 credits", estimate: 3000, cashLike: true }, term: null,
    verificationStatus: "official", source: "active-credits-07-10-2026", notes: "" },
  { vendor: "Jam",          programId: "jam-team-perk", lane: "DevOps",
    value: { label: "1 yr Team plan ($170)", estimate: 170, cashLike: false }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Total value stated in source." },
  { vendor: "Gravatar",     programId: "gravatar-domain", lane: "Business",
    value: { label: "1 yr free incl. domain", estimate: 100, cashLike: false }, term: "12 mo",
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Includes a free domain for 1 yr; program value confirmed at $100." },
  { vendor: "Anam",         programId: "anam-discount", lane: "Multimedia",
    value: { label: "$300/mo plan for $30/mo", estimate: 3240, cashLike: false }, term: null,
    verificationStatus: "official", source: "active-credits-07-10-2026",
    notes: "Discount at source-stated rates; estimate is 12 mo of savings ($270/mo × 12)." },

  // ── Unverified-claimed (corral — retained, never silently dropped) ────
  { vendor: "Fin AI Startup Pack", programId: "fin-startup-pack", lane: "Business",
    value: { label: "Multi-vendor umbrella pack", estimate: null, cashLike: false }, term: null,
    verificationStatus: "unverified-claimed", source: "active-credits-07-10-2026",
    notes: "Unlocked per internal reference (T0 umbrella); not itemized in the latest active-credits pass. Partner redemptions counted individually where confirmed (e.g. ElevenLabs)." },
];

// ── Derived groupings and totals ─────────────────────────────────────────

export function groupAwardsByLane(awards = REAL_AWARDS) {
  const groups = {};
  for (const a of awards) {
    if (!groups[a.lane]) groups[a.lane] = [];
    groups[a.lane].push(a);
  }
  return groups;
}

function sum(awards, pred) {
  return awards
    .filter(a => a.value.estimate != null && pred(a))
    .reduce((s, a) => s + a.value.estimate, 0);
}

export function awardTotals(awards = REAL_AWARDS) {
  const official = awards.filter(a => a.verificationStatus === "official");
  const unverified = awards.filter(a => a.verificationStatus === "unverified-claimed");
  return {
    confirmedCash:    sum(official, a => a.value.cashLike),
    confirmedInKind:  sum(official, a => !a.value.cashLike),
    confirmedTotal:   sum(official, () => true),
    unverifiedTotal:  sum(unverified, () => true),
    uncountedVendors: awards.filter(a => a.value.estimate == null).map(a => a.vendor),
  };
}
