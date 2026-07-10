# Setup Kit and Guided Flow

Status: durable product doc
Owner: Jami Studio

This doc defines the two founder-facing offerings layered on top of the finder: the
**guided umbrella-first flow** and the **agent-pointable example library**. It is the
product contract; the dated Phase 3 roadmap holds the build steps.

## The core insight

Founders lose value not because programs are hidden but because they apply in the
wrong order and start every application from a blank page. Benefit Hunter fixes both:
it prescribes an application order that maximizes referral leverage, and it hands over
proven copy to adapt.

## Part 1 — Guided umbrella-first flow

### Tiering model

Programs are ranked by referral leverage and breadth of downstream unlocks, not raw
headline dollars. This mirrors the Jami Studio operating strategy.

| Tier | Type | Examples | Why it comes first |
| --- | --- | --- | --- |
| T0 — Umbrella | Multi-vendor packs | Fin AI Startup Pack | One acceptance unlocks dozens of partner offers and becomes proof on later apps. Redeem partners within the pack window (often ~60 days). |
| T1 — Referral hubs | Programs other vendors recognize | Retool, GitHub for Startups, Amplitude, Intercom/Fin | Cite them on direct applications to reach partner-tier benefits. One hub referral can unlock several vendors. |
| T2 — Direct solo | Single-vendor credits/discounts | Algolia, Make, Snowflake, cloud + LLM providers | Apply after T0/T1, using any partner affiliation you now hold; otherwise apply when the product surface justifies usage. |
| T3 — Inventory only | Personal subs, expiring trials | misc. | Track for runway awareness; do not design a stack around them. |

**Rule surfaced to the user:** exhaust umbrella and referral-hub applications before
burning one-off solo lanes that might have been reachable through a pack or partner.

### Flow shape

1. **Qualify** — user fills the lightweight profile; the finder computes matched
   programs and total qualified value.
2. **Order** — results are grouped by tier with a recommended sequence (T0 → T1 →
   T2), each with an "apply now / apply after X" state driven by dependency and
   referral data already present in the catalog (`dependencies`, `tags`, `access`).
3. **Prepare** — for each program, the user gets: the official apply URL, the fields
   that program asks for (`formConfig.fields`), which of those their profile already
   answers (readiness), and a link into the matching example (Part 2).
4. **Track** — local-storage status per program (`interested` / `applied` /
   `awarded` / `denied`), using the existing statuses model. No account required.

### What powers it (already in the app)

- `src/data/programs.js` — tier, access, tags, dependencies, `formConfig.fields`,
  apply/marketing URLs, value.
- `src/data/profile.js` — profile document + `profileMatches` + readiness.
- `src/lib/agent.js` — readiness classification (relabel `Submit Ready` as
  "ready to fill & review," never "auto-submit").
- `src/data/statuses.js` — per-program status states.

The guided flow is primarily a **presentation and sequencing layer** over data the
app already holds, plus a small amount of new tier-ordering/dependency logic.

## Part 2 — Example application library

### What it is

A curated set of real, successful application answers Jami Studio submitted, turned
into reusable archetypes a founder can point their agent at and redraft.

### Source

`_ops/programs/applications/submitted/` (private) holds ~23 real submissions (AWS
Activate, Anthropic, Algolia, Retool, ElevenLabs, Snowflake, Vercel, Make,
Confidence, Massive, Reducto, SendPulse, Scaleway, Together, Fireworks, and more),
plus `_ops/programs/benefits/evidence/jami-studio-use-cases-reference.md` as the
master reusable text.

### Templatization contract (critical)

Examples must be **de-identified into archetypes, not sterilized into uselessness.**

Remove or replace:
- Real personal PII: names, emails, phone, personal addresses, DOB.
- Company-identifying specifics: legal entity name, EIN/Tax ID, exact address,
  incorporation IDs.
- Any secret-like values: referral/coupon codes, invoice numbers, support ticket
  IDs, portal links, account IDs.

Keep (this is the value):
- The **shape and voice** of a strong answer.
- The **substance** of use-case descriptions, workload framing, and traction
  narrative, generalized to a placeholder company archetype (e.g. `{{company_name}}`,
  `{{one_liner}}`, `{{ai_use_case}}` bound to the profile schema keys).
- Program-specific guidance: what this vendor actually asks for, what a winning
  answer emphasized, common rejection reasons, and referral notes.

Each library entry maps its placeholders to the profile document keys in
`src/data/profile.js` so a user's filled profile (or their agent) can hydrate the
template directly.

### Agent-pointable format

Each example ships as a plain markdown file with:
- A short "what this program wants" header (fields, tone, length).
- The templated answer blocks keyed to profile fields.
- A "redraft instructions" note the user can hand to their agent verbatim.

This makes the library usable both by a human copy-pasting and by a coding agent the
user points at the file.

## Part 3 — Real-dollars-by-stack view

A proof surface backed by `active-credits` (see
[architecture/data-and-truth-model.md](../architecture/data-and-truth-model.md)).
It shows the actual value Jami Studio secured, organized by stack/feature lane
(compute, data, AI/LLM, analytics, search, voice/media, automation, support), so a
visitor sees a real, itemized outcome rather than an abstract promise. Claimed-but-
unverified awards are shown in a clearly separated group, never silently dropped.

## Out of scope for these offerings

- No auto-submission, no headless form filling, no impersonation.
- No storage of a user's real application answers on a server (local storage only).
- The self-serve automation kit is a separate add-on (Phase 4), not part of the
  guided flow.
