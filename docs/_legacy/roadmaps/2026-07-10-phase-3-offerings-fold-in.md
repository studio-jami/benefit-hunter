# Benefit Hunter Offerings Fold-In Implementation Plan

Date: 2026-07-10
Status: [x] Complete (2026-07-10)
Source reports: `docs/product/setup-kit-and-guided-flow.md`, `docs/architecture/data-and-truth-model.md`
Owner: Jami Studio
Surface: `apps/hunter/src`, generated data artifacts, `_ops/programs/applications`, `_ops/programs/active-credits-*.md`

## Purpose

Add the differentiated offerings on top of the deployed baseline: the guided
umbrella-first application flow, the agent-pointable example library, and the
real-dollars-by-stack proof view. All client-side, local-storage only, no auth. Starts
only after Phase 2 acceptance criteria are met.

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Complete
- [!] Blocked or needs explicit decision

## Source Findings

- The catalog already carries `tier`, `access`, `tags`, `dependencies`,
  `formConfig.fields`, and apply/marketing URLs — enough to drive tier ordering and
  per-program readiness.
- `src/data/profile.js` holds the 38-field profile document, `profileMatches`, and
  `getApplicationReadiness`; `src/lib/agent.js` classifies readiness.
- `_ops/programs/applications/submitted/` holds ~23 real submissions;
  `_ops/programs/benefits/evidence/jami-studio-use-cases-reference.md` is the master
  reusable text.
- `_ops/programs/active-credits-07-10-2026.md` is the dated source of truth for real
  awards; some entries are net-new vs the catalog.
- `partner-credit-map.md` defines the T0→T3 tier strategy.

## Locked Decisions

- Guided flow is a presentation/sequencing layer over existing catalog + profile data
  plus small new tier/dependency logic; it does not add a backend.
- `Submit Ready` is relabeled "ready to fill & review"; the tool never auto-submits.
- The example library ships as de-identified archetypes keyed to profile-schema
  placeholders — informative, not sterilized.
- The real-awards view is generated from `active-credits`, reviewed, and committed as
  a public artifact; claimed-but-unconfirmed items are corralled as
  `unverified-claimed`, never deleted.
- No redemption links, codes, invoice IDs, account IDs, or PII enter public artifacts.

## Scope Boundaries

- Security/privacy: de-identification per `docs/security/privacy-and-secrets.md` is a
  hard gate on every example and every award record.
- Data: `active-credits` wins all value conflicts; regenerate rather than hand-edit.
- No auth, no server, no Stripe.
- No auto-submission or headless form filling.

## Repo Guidance

- Keep new data as versioned artifacts under `apps/hunter/src/data/` (e.g.
  `realAwards.js`, an `examples/` set, tier-order helpers in `src/lib/`).
- Generate public artifacts from `_ops/` via a reviewed step; never import `_ops/`
  into the app bundle.
- Keep files within the app's existing code-health expectations; split early.
- Add focused tests for tier ordering, readiness mapping, example placeholder
  hydration, and award grouping/totals.

## Target Product Shape

- A tiered, ordered results view (T0 → T1 → T2) with per-program apply URL, required
  fields, readiness, and a link into the matching example.
- An example library: one markdown archetype per program with field-keyed
  placeholders and agent redraft instructions.
- A real-dollars-by-stack proof page with confirmed vs unverified-claimed groups,
  totals, and freshness date.

## Cross-Stream Dependency Map

- Workstream 1 (real-awards artifact) is independent and can start first.
- Workstream 2 (example library generation) is independent of 1.
- Workstream 3 (guided flow) consumes catalog/profile and links to Workstream 2 output.
- Workstream 4 (proof view) consumes Workstream 1 output.
- Workstream 5 (tests + closeout) consumes all.

## Workstream 1: Real-Awards Artifact From active-credits

Goal: A committed public artifact of real awards, grouped by stack, with verification
status.

Depends on:

- [x] Phase 2 baseline live.

Enables:

- [x] Workstream 4 proof view.

Primary areas:

- `_ops/programs/active-credits-07-10-2026.md` (private source)
- `apps/hunter/src/data/realAwards.js` (generated public artifact)
- `apps/hunter/src/data/lanes.js`

Implementation tasks:

- [x] Parse the latest `active-credits` file into structured records
      (vendor, value, term, lane, source date).
- [x] Resolve value conflicts in favor of `active-credits` over older artifacts.
- [x] Assign `verificationStatus` (`official` for current-truth items;
      `unverified-claimed` for previously-tracked/claimed items not confirmed).
- [x] Map each record to a stack lane; extend `lanes.js` if needed. (Existing
      lanes sufficed.)
- [x] Strip all codes/links/PII; commit the reviewed artifact.
      (Plan values verified against live vendor pricing pages on 2026-07-10;
      custom-priced plans carry `estimate: null` and are excluded from totals
      rather than guessed.)

Exit criteria:

- [x] `realAwards.js` exists, is de-identified, and totals confirmed vs
      unverified-claimed correctly.

Suggested verification:

- Focused test asserting no code/link/PII patterns and correct group totals.

## Workstream 2: Example Library

Goal: De-identified, agent-pointable application archetypes.

Depends on:

- [x] Phase 2 baseline live.

Primary areas:

- `_ops/programs/applications/submitted/` (private source)
- `_ops/programs/benefits/evidence/jami-studio-use-cases-reference.md`
- `apps/hunter/src/data/examples/` (public, generated)
- `apps/hunter/src/data/profile.js` (placeholder keys)

Implementation tasks:

- [x] Select the strongest submissions to templatize first (umbrella + high-value
      referral hubs: e.g. AWS Activate, Retool, Anthropic, Algolia, Snowflake, Vercel,
      Make, ElevenLabs).
- [x] Replace identifiers with profile-schema placeholders; strip all codes/links/IDs.
- [x] Add a "what this program wants" header and agent redraft instructions per file.
- [x] Key each example to its catalog program id. (Retool/Snowflake/Make have no
      catalog entry yet; keyed `programId: null` until added.)

Exit criteria:

- [x] Each shipped example is de-identified, hydratable from the profile schema, and
      linked from its catalog program.

Suggested verification:

- Test asserting placeholders resolve to real profile keys and no raw PII/codes remain.

## Workstream 3: Guided Umbrella-First Flow

Goal: Tiered, ordered application guidance over the existing catalog + profile.

Depends on:

- [x] Workstream 2 (for per-program example links).

Primary areas:

- `apps/hunter/src/lib/` (tier ordering, dependency gating)
- `apps/hunter/src/components/` (results grouping UI)
- `apps/hunter/src/data/programs.js` (tier/dependencies/tags)

Implementation tasks:

- [x] Add tier-ordering logic (T0 → T1 → T2 → T3) with an "apply now / apply after"
      state from `dependencies` and referral tags. (`src/lib/guidedFlow.js`)
- [x] Surface, per program: apply URL, required fields, profile readiness, example link.
- [x] Relabel readiness so `Submit Ready` reads as fill-and-review, not auto-submit.
- [x] Persist per-program status in local storage using the existing statuses model.

Exit criteria:

- [x] Users see a correct, ordered plan with readiness and example links; no backend.

Suggested verification:

- Tests for tier ordering, dependency gating, and readiness mapping.

## Workstream 4: Real-Dollars-By-Stack Proof View

Goal: A proof page itemizing real awards by stack with honest totals.

Depends on:

- [x] Workstream 1.

Primary areas:

- `apps/hunter/src/data/realAwards.js`
- `apps/hunter/src/components/`

Implementation tasks:

- [x] Group awards by stack lane; render confirmed and unverified-claimed separately.
- [x] Show confirmed total prominently and the unverified subtotal distinctly.
- [x] Show the sourcing `active-credits` date as freshness.
- [x] Link each award to its catalog program when one exists.

Exit criteria:

- [x] The proof view renders grouped, labeled, dated, and totals reconcile.

## Workstream 5: Tests, Docs, Closeout

Goal: Lock behavior and update durable docs.

Implementation tasks:

- [x] Add the focused tests listed above. (`apps/hunter/src/test/` — vitest, 28
      tests: tier ordering, dependency gating, readiness mapping, placeholder
      hydration, award grouping/totals, de-identification patterns.)
- [x] Update `docs/` if any contract changed. (No contract changes; implementation
      matches the product and data-truth docs.)
- [x] Update this roadmap's checkboxes; retire to `docs/_legacy/roadmaps/` when done.

## Acceptance Criteria

- Users get: a personalized qualified total, an ordered umbrella-first plan with
  per-program readiness and example links, an agent-pointable example library, and a
  real-dollars-by-stack proof view — all client-side, de-identified, and honest about
  verification. No auth, no server, no auto-submission.

## Implementation Order

1. Workstream 1 — real-awards artifact.
2. Workstream 2 — example library.
3. Workstream 3 — guided flow.
4. Workstream 4 — proof view.
5. Workstream 5 — tests, docs, closeout.

## Expansion Track

- Approval-rate insights once enough anonymized signal exists (would need data
  collection — revisit with the monetization decision, not now).
- LinkedIn import to pre-fill the profile and cut fill time.
