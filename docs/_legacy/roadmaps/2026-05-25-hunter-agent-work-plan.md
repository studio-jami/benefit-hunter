# Hunter Extension Agent Work Implementation Plan

Date: 2026-05-25
Status: [ ] Planned
Source reports: `docs/research/monetization.md`
Owner: Yrka
Surface: Yrka Benefit Hunter browser extension, `packages/hunter-core`, `packages/hunter-extension-contract`, `apps/web` Hunter APIs, application autofill, human-submit workflow, agent drafting, entitlement checks, digest/retention loop

## Purpose

Implement only the agentic/autofill system after Hunter has been integrated into the Yrka monorepo. The default product shape is a lightweight Manifest V3 browser extension that recognizes benefit application pages, fills forms from the user's saved Yrka profile, and lets the user review and click submit themselves. This plan must not include SEO, route cleanup, general tooling, broad UI refactors, database consolidation, or server-side Playwright/headless-browser submission infrastructure.

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Complete
- [!] Blocked or needs explicit decision

## Source Findings

- `docs/research/monetization.md` argues that the strongest monetization trigger is after personalized value is shown, that the profile is the moat, and that the cleaner agent shape is a browser extension rather than server-side Playwright automation.
- `src/lib/agent.js` currently classifies benefits as `submit`, `draft`, `research`, or `stale`; this is readiness labeling, not an execution runtime.
- `src/data/profile.js` owns the profile document schema and application readiness logic that future autofill and draft systems can consume.
- `src/data/programs.js` includes `urls`, `formConfig.platform`, `formConfig.fields`, `tags`, `eligibility`, `value`, and `lastVerified`; this is already close to a URL-to-program and canonical-field mapping source.
- `src/lib/remoteState.js` currently stores user-level profile, profile document, statuses, and accents only. It does not expose a profile API for an extension.
- The setup plan now moves Hunter into Yrka: public finder route in `apps/marketing`, authenticated profile/status APIs in `apps/web`, shared domain contracts in packages, and persistence in the Yrka Supabase project.
- Yrka already has `@yrka/db` and `@yrka/auth` with Supabase SSR sessions, route-access classification, signup, session sync, and protected API patterns. Extension sync should use those surfaces instead of creating standalone Hunter auth.
- The setup plan owns Yrka integration, shared contracts, route ownership, and database consolidation. This agent plan starts only after those foundations exist.
- Official/current external sources checked for the planning direction:
  - Chrome extension docs define Manifest V3 extensions around `manifest.json`, extension service workers, content scripts, extension pages/popups, messaging, permissions, and storage.
  - Chrome content-script docs support the extension model where code runs on matched pages and can inspect/change the page DOM with the right permissions.
  - Chrome storage docs note storage is available to extension contexts and that Manifest V3 service workers may need to load state from storage because they are not persistent.

## Locked Decisions

- The first agent product is extension-assisted autofill, not server-side Playwright automation.
- The user submits applications. The product fills, drafts, checks readiness, and records status; it does not click submit in the MVP.
- The browser extension runs in the user's browser/session and uses the user's page context for form filling. It does not need server-side browser pools, CAPTCHA workarounds, anti-detection tooling, or remote credential custody for the MVP.
- `Submit Ready` means "safe to fill and user-review quickly," not "safe for the system to auto-submit."
- `Draft Ready` means "can prepare copy or packet from profile data," not "can submit."
- `Research Only`, stale, billing, KYC, legal, proposal, partner, human-review, manual-submit, and unsupported-platform programs remain no-submit/manual-review paths.
- The extension syncs profile and statuses through `apps/web` Hunter APIs backed by Yrka auth and Supabase. It must not read service-role keys or direct database secrets.
- Entitlements meter autofill, draft, packet export, digest, or premium insights actions behind an app-owned adapter. Billing provider selection belongs to a separate monetization implementation plan unless this plan explicitly adds a minimal local entitlement stub.

## Scope Boundaries

- In scope: extension manifest, content script, service worker, popup, URL/program recognition, canonical-field matching, profile sync through `apps/web`, user-triggered autofill, mark-applied sync, application packet/draft generation, weekly digest hooks, quotas/entitlements, audit events, and extension operations docs.
- Out of scope: SEO, canonical routing, setup/tooling, database consolidation, broad app UI redesign, payment checkout, affiliate setup, full billing, server-side Playwright pools, auto-submit, credential vaulting for third-party accounts, CAPTCHA bypass, email-inbox automation, and multi-page form orchestration beyond explicit MVP support.
- Provider access: current official docs must be checked before implementing extension APIs, LLM SDKs, email providers, entitlement providers, and Chrome Web Store publication behavior.
- Privacy: the extension can fill only from user-approved profile fields and should prefer showing a preview before writing values into the page.
- Safety: content scripts should request the smallest practical host permissions and should not inject on unrelated pages.
- Compliance: user-facing copy must clarify that the user reviews and submits, and any referral/affiliate relationship must be disclosed.

## Repo Guidance

- Start only after the Yrka integration setup plan acceptance criteria are complete.
- Keep extension code isolated from `apps/marketing` and `apps/web` except shared domain contracts, generated catalog/profile artifacts, and explicit API clients.
- Prefer generated, versioned extension data artifacts from `packages/hunter-extension-contract` over importing app internals directly into the extension bundle.
- Keep Chrome-specific APIs behind an extension adapter where possible so the core matching/fill engine can be tested in plain JS.
- Tests should cover URL matching, field matching, React/Vue controlled-input event dispatch, policy gates, and status sync before broad UI tests.
- Every external side effect must be user-triggered in MVP: fill form, mark applied, save profile, export packet.

## Target Product Shape

- A founder uses `www.yrka.io/startup-benefits-finder`, runs profile matching, sees personalized qualified value, and signs in when saving that result.
- The saved Yrka Hunter profile document becomes the durable moat and extension data source.
- The extension recognizes a supported benefit page from the catalog URL map.
- The extension popup shows program name, value, readiness, required fields, filled/missing profile fields, and clear actions.
- The user clicks `Fill Form`; the content script fills known fields using canonical profile data.
- The user reviews, edits, and clicks the website's submit button manually.
- The extension offers `Mark Applied`; the status syncs back to Benefit Hunter.
- Premium behavior can include unlimited autofill, saved application packets, weekly digest, advanced filters, approval-rate insights, and cohort/white-label accelerator surfaces.

## Cross-Stream Dependency Map

- Workstream 1 establishes policy and product capability boundaries consumed by all later streams.
- Workstream 2 consumes extension-ready catalog/profile contracts from Yrka packages and adds extension package artifacts.
- Workstream 3 consumes `apps/web` profile/status APIs and adds extension auth/connect handoff.
- Workstream 4 builds the Manifest V3 extension shell consumed by matching and autofill.
- Workstream 5 builds URL recognition and field matching consumed by the user-triggered fill flow.
- Workstream 6 adds web-app extension handoff and status surfaces.
- Workstream 7 adds drafting/packet support after the core autofill loop works.
- Workstream 8 adds digest and retention hooks after statuses and readiness lists exist.
- Workstream 9 adds entitlements and premium gating after useful events exist.
- Workstream 10 performs operations, store-readiness, verification, and closeout.

## Workstream 1: Policy And Capability Contracts

Goal: Define exactly what the extension may recognize, fill, draft, export, and record before implementation starts.

Depends on:

- [ ] Completed Yrka integration setup contracts for program, profile document, application readiness, extension manifest, web APIs, and validation.

Enables:

- [ ] Workstream 2 extension-ready data artifacts.
- [ ] Workstream 5 field matching and autofill.
- [ ] Workstream 9 entitlement gating.

Repo guidance:

- Make policy executable, not prose-only. UI labels can explain policy but must not enforce policy alone.

Primary areas:

- `packages/hunter-core`
- `packages/hunter-extension-contract`
- `apps/extension` or selected extension package directory
- `docs/product/agent-policy.md`
- `docs/architecture/extension-agent.md`

Implementation tasks:

- [ ] Define `AgentCapability` values for `recognize`, `preview_fields`, `fill_form`, `draft_packet`, `mark_applied`, `manual_only`, and `blocked`.
- [ ] Define policy rules from program tags, access type, form platform, required fields, source freshness, billing/KYC/legal risk, and unsupported-site status.
- [ ] Define `Submit Ready` as user-reviewed autofill readiness, not automatic submission permission.
- [ ] Add tests for every current tag that affects filling, drafting, or blocking.
- [ ] Document the human-submit boundary in durable product/agent policy docs.

Exit criteria:

- [ ] The extension cannot show a fill action without a policy allow result.
- [ ] Risky programs are blocked or packet-only by executable policy.

Suggested verification:

- `npm run test:run -- agent-policy`
- `npm run validate`

## Workstream 2: Extension-Ready Catalog And Field Contracts

Goal: Turn Yrka Hunter package contracts into versioned artifacts the extension can safely consume.

Depends on:

- [ ] Workstream 1 policy contracts.

Enables:

- [ ] Workstream 4 extension shell.
- [ ] Workstream 5 URL recognition and field matching.

Repo guidance:

- Use generated artifacts where it avoids extension bundling drift. Keep source of truth in Yrka-owned package contracts.

Primary areas:

- `packages/hunter-core`
- `packages/hunter-extension-contract`
- `apps/extension` or selected extension package directory
- `scripts/`

Implementation tasks:

- [ ] Define an `ExtensionProgramManifest` with program ID, canonical URL patterns, value label, readiness metadata, required profile fields, known selectors, and policy snapshot version.
- [ ] Generate URL match patterns from `program.urls.apply` and known aliases.
- [ ] Define canonical profile field metadata for extension display and fill behavior.
- [ ] Add known-selector override support for priority programs without requiring overrides for MVP.
- [ ] Validate that all extension manifests reference valid profile fields and program IDs.
- [ ] Add fixture pages for the five most common fields: `company_name`, `website`, `email`, `first_name`, and `last_name`.

Exit criteria:

- [ ] The extension can load a versioned manifest without importing app internals at runtime.

Suggested verification:

- `npm run validate`
- `npm run test:run -- extension-manifest`

## Workstream 3: Profile Sync API And Auth Handoff

Goal: Let the extension fetch profile data and update application statuses through Yrka web APIs without direct database coupling.

Depends on:

- [ ] Yrka integration setup persistence/API surfaces.
- [ ] Workstream 2 extension field contracts.

Enables:

- [ ] Workstream 4 extension MVP.
- [ ] Workstream 6 web-app handoff.

Repo guidance:

- The extension talks to Yrka `apps/web` APIs/adapters, never directly to Supabase service secrets.

Primary areas:

- `apps/web/app/api/hunter/profile`
- `apps/web/app/api/hunter/statuses`
- `apps/web/app/api/hunter/entitlements`
- `packages/hunter-core`
- `packages/hunter-extension-contract`
- `apps/extension`
- `docs/operations/extension-auth.md`

Implementation tasks:

- [ ] Use the Yrka setup-plan profile read API that returns only extension-safe fields and field metadata.
- [ ] Use the Yrka setup-plan status update API for `mark_applied`, `skip`, and related user-owned status changes.
- [ ] Add an extension connect flow from `apps/web` using a safe token/session pattern verified against current browser extension docs.
- [ ] Add CORS and origin handling for the extension origin without weakening `apps/web`.
- [ ] Add tests for unauthorized extension calls, user ownership, and field filtering.

Exit criteria:

- [ ] The extension can sync the signed-in user's profile and statuses without embedding database credentials.

Suggested verification:

- `npm run test:run -- extension-api`
- `npm run build`

## Workstream 4: Manifest V3 Extension Shell

Goal: Build the minimal extension container: manifest, service worker, content script, popup, storage, and messaging.

Depends on:

- [ ] Workstream 2 extension manifest artifact.
- [ ] Workstream 3 profile sync API.

Enables:

- [ ] Workstream 5 autofill.
- [ ] Workstream 6 app handoff.

Repo guidance:

- Keep extension package boundaries explicit. Avoid coupling it to the web app's React app shell.

Primary areas:

- `apps/extension/manifest.json`
- `apps/extension/src/content/`
- `apps/extension/src/service-worker/`
- `apps/extension/src/popup/`
- `apps/extension/src/storage/`
- `apps/extension/tests/`

Implementation tasks:

- [ ] Add Manifest V3 `manifest.json` with least-privilege permissions, popup/action, service worker, and content-script strategy.
- [ ] Add service worker that loads profile/cache state from extension storage and communicates with content scripts and popup.
- [ ] Add content script that detects supported pages and waits for explicit fill commands.
- [ ] Add popup UI that shows program match, value, readiness, field readiness, `Fill Form`, and `Mark Applied`.
- [ ] Add extension storage adapter for cached profile and settings.
- [ ] Add local extension build/watch/load instructions.

Exit criteria:

- [ ] The extension can load locally in Chrome, detect a fixture URL, and render a popup without filling anything yet.

Suggested verification:

- Extension unit tests.
- Manual Chrome load-unpacked smoke.
- `npm run build`

## Workstream 5: URL Recognition And Field Autofill Engine

Goal: Fill supported fields from profile data on user command.

Depends on:

- [ ] Workstream 1 policy.
- [ ] Workstream 2 field contracts.
- [ ] Workstream 4 extension shell.

Enables:

- [ ] Workstream 6 status sync.
- [ ] Workstream 7 drafting/packet support.

Repo guidance:

- Autofill is an action the user triggers. The user remains responsible for review and submission.

Primary areas:

- `apps/extension/src/content/`
- `apps/extension/src/fill-engine/`
- `apps/extension/tests/fixtures/`
- `packages/hunter-extension-contract`

Implementation tasks:

- [ ] Implement URL-to-program matching against the generated extension manifest.
- [ ] Implement layered field matching by label text, input attributes, placeholder, type hints, and known selector overrides.
- [ ] Implement controlled-input setters that dispatch native input/change events for React/Vue-style forms.
- [ ] Add preview data for fields that will be filled and fields that are missing.
- [ ] Add dry-run mode that reports matches without writing values.
- [ ] Add tests with plain HTML and controlled-input fixture pages.
- [ ] Add hard blocking for password, payment, card, SSN/tax, and unsupported sensitive fields unless a later explicit policy allows them.

Exit criteria:

- [ ] A user can fill the five MVP fields on fixture pages and at least one approved live low-risk program page, then click submit themselves.

Suggested verification:

- `npm run test:run -- fill-engine`
- Manual extension smoke on fixture pages.
- Manual approved smoke on a low-risk public form.

## Workstream 6: Web App Handoff And Status Loop

Goal: Make the web app and extension feel like one product without building heavy backend automation.

Depends on:

- [ ] Workstream 3 profile/status API.
- [ ] Workstream 4 extension shell.
- [ ] Workstream 5 fill engine.

Enables:

- [ ] Retention and entitlement work.

Repo guidance:

- The Yrka finder and web app remain the profile/corpus/dashboard home. The extension handles high-intent in-page actions.

Primary areas:

- `apps/marketing/app/startup-benefits-finder`
- `apps/web/app/api/hunter/*`
- `apps/extension/src/popup/`
- `packages/hunter-core`
- `docs/product/extension-flow.md`

Implementation tasks:

- [ ] Add app UI for extension install/connect status.
- [ ] Add "open application page" and "continue in extension" actions for supported programs.
- [ ] Add status sync so `Mark Applied` updates the web app.
- [ ] Add missing-profile-field handoff from extension to web app profile editor.
- [ ] Add clear user copy: fill is assisted, submit is manual.

Exit criteria:

- [ ] A user can move from web app profile to application page to extension autofill to web app status update.

Suggested verification:

- Browser smoke for web app handoff.
- Extension smoke for mark-applied sync.

## Workstream 7: Draft Packets And Copy Assistance

Goal: Generate or assemble reviewable application copy without submitting it.

Depends on:

- [ ] Workstream 1 policy.
- [ ] Workstream 3 profile API.
- [ ] Workstream 5 field engine.

Enables:

- [ ] Premium tier upsell and higher completion rates.

Repo guidance:

- Drafting may use LLMs later, but the first version should support deterministic profile-field packets before provider calls.

Primary areas:

- `src/domain/applications/`
- `src/domain/drafts/`
- `src/adapters/llm/`
- `apps/extension/src/popup/`
- `apps/marketing/app/startup-benefits-finder`
- `apps/web/app/api/hunter/*`

Implementation tasks:

- [ ] Add deterministic application packet generation from profile fields and program formConfig.
- [ ] Add copy-ready field packets for manual-only and draft-ready programs.
- [ ] Add optional LLM adapter for longer answers only after current official provider docs and cost/rate limits are checked.
- [ ] Store draft metadata, prompt version, source evidence, and user edits if persistence is added.
- [ ] Add tests with fake LLM adapters and no-provider deterministic packets.

Exit criteria:

- [ ] Users can get copy-ready packets without any submission side effect.

Suggested verification:

- `npm run test:run -- drafts`
- Manual packet generation smoke.

## Workstream 8: Digest And Retention Loop

Goal: Turn statuses and readiness into a useful recurring task loop.

Depends on:

- [ ] Workstream 6 status loop.
- [ ] Workstream 7 packet readiness if draft reminders are included.

Enables:

- [ ] Retention and monetization.

Repo guidance:

- The digest is a task list, not generic newsletter content.

Primary areas:

- `src/domain/digest/`
- `src/adapters/email/`
- `src/domain/applications/`
- `docs/product/retention.md`

Implementation tasks:

- [ ] Define digest eligibility: submit-ready not applied, draft-ready missing review, expiring programs, stale verifications, and high-value unmatched programs.
- [ ] Add digest preview in-app before email automation.
- [ ] Add email adapter behind an app-owned interface if email sending is implemented.
- [ ] Add unsubscribe/preferences model before scheduled email is enabled.
- [ ] Add tests for digest selection logic.

Exit criteria:

- [ ] A user can see a personalized queue/digest preview generated from real statuses and profile data.

Suggested verification:

- `npm run test:run -- digest`

## Workstream 9: Entitlements And Premium Hooks

Goal: Gate useful extension and packet features without locking the app to a billing provider.

Depends on:

- [ ] Workstream 6 status loop.
- [ ] Workstream 7 packet generation.

Enables:

- [ ] Paid agent/autofill tiers and accelerator packaging.

Repo guidance:

- Keep checkout/payment out unless a separate monetization plan explicitly adds it.

Primary areas:

- `src/domain/entitlements/`
- `src/adapters/entitlements/`
- `apps/extension/src/popup/`
- `apps/marketing/app/startup-benefits-finder`
- `apps/web/app/api/hunter/*`

Implementation tasks:

- [ ] Define entitlement actions for `save_personalized_results`, `extension_autofill`, `packet_export`, `draft_generation`, `digest_email`, and `premium_insights`.
- [ ] Add free/default limits and premium-placeholder checks behind an entitlement adapter.
- [ ] Add extension-side messaging for locked features and profile/account CTA.
- [ ] Add usage event tracking without storing sensitive field values.
- [ ] Add tests for quota and entitlement decisions.

Exit criteria:

- [ ] Premium hooks exist without forcing a billing provider or blocking the free recognition/value hook.

Suggested verification:

- `npm run test:run -- entitlements`

## Workstream 10: Operations, Store Readiness, And Closeout

Goal: Verify the extension-assisted loop, document operations, and publish only intentional work.

Depends on:

- [ ] Workstreams 1 through 9 complete.

Enables:

- [ ] Controlled extension beta.

Repo guidance:

- Do not claim automated submission. Claim assisted autofill and user-reviewed application completion.

Primary areas:

- `apps/extension`
- `docs/operations/extension.md`
- `docs/product/agent-policy.md`
- `docs/architecture/extension-agent.md`

Implementation tasks:

- [ ] Add extension development, load-unpacked, permission review, release packaging, and rollback docs.
- [ ] Add Chrome Web Store asset/privacy checklist if publication is in scope.
- [ ] Run full app and extension verification.
- [ ] Run a user-flow smoke from profile save to page recognition to autofill to manual submit readiness to mark-applied sync.
- [ ] Verify no secrets or sensitive profile values are logged or bundled.
- [ ] Stop helpers, stage intentional files, commit, and push.

Exit criteria:

- [ ] The extension-assisted agent loop is implemented, verified, documented, committed, and pushed.

Suggested verification:

- `npm run verify`
- Extension unit/integration tests.
- Manual load-unpacked smoke.
- Manual user-flow smoke on fixture and one approved low-risk live page.
- `git diff --check`
- `git status --short`

## Final Verification And Closeout

- [ ] `npm run verify` passes.
- [ ] Extension manifest, content script, service worker, popup, URL recognition, field matching, profile sync, and status sync tests pass.
- [ ] Fixture form autofill works for the five MVP fields.
- [ ] Controlled-input event dispatch is verified on React/Vue-style fixtures.
- [ ] Web app to extension to status-sync loop is verified.
- [ ] Any live smoke is explicitly approved, low-risk, and user-submit only.
- [ ] Durable extension, policy, and operations docs are updated.
- [ ] No secrets or sensitive profile values appear in docs, logs, fixtures, snapshots, or bundled artifacts.
- [ ] Long-running helpers started during implementation are stopped.
- [ ] Only intentional files are staged, committed, and pushed.

## Acceptance Criteria

- [ ] Agent work starts from Yrka setup-owned contracts and does not re-solve setup, SEO, routing, database consolidation, or general tooling.
- [ ] The MVP is extension-assisted autofill, not server-side Playwright automation.
- [ ] The user clicks submit manually.
- [ ] Extension policy gates are executable and tested.
- [ ] Extension data artifacts are generated from Yrka package-owned catalog/profile contracts.
- [ ] Profile sync and status sync use Yrka `apps/web` APIs without direct database secrets in the extension.
- [ ] Field matching covers labels, attributes, placeholders, type hints, selector overrides, and controlled-input events.
- [ ] Premium hooks can meter useful actions without billing-provider lock-in.
- [ ] Operations docs explain permissions, publication, rollback, privacy, and support.

## Implementation Order

1. Complete Workstream 1 policy and capability contracts.
2. Add Workstream 2 extension-ready catalog and field contracts.
3. Build Workstream 3 profile sync API and auth handoff.
4. Build Workstream 4 Manifest V3 extension shell.
5. Implement Workstream 5 URL recognition and field autofill.
6. Implement Workstream 6 web app handoff and status loop.
7. Implement Workstream 7 draft packets and copy assistance.
8. Implement Workstream 8 digest and retention loop.
9. Implement Workstream 9 entitlements and premium hooks.
10. Run Workstream 10 operations, store-readiness, and closeout.

## Expansion Track

- Known selector overrides for the highest-value programs.
- Multi-page form assistance where terms and UX allow it.
- White-label/co-branded accelerator extension profile.
- Aggregated anonymous approval-rate insights.
- Premium report product based on anonymized application outcomes.
- Optional human concierge workflow for high-value/manual-only programs.

## Sources

- Local: `docs/research/monetization.md`
- Local Hunter source input: `src/lib/agent.js`
- Local Hunter source input: `src/data/profile.js`
- Local Hunter source input: `src/data/programs.js`
- Local Hunter source input: `src/lib/remoteState.js`
- Local Yrka target: `packages/hunter-core`
- Local Yrka target: `packages/hunter-extension-contract`
- Local Yrka target: `apps/web/app/api/hunter/*`
- Local Yrka target: `apps/extension`
- Local: `docs/roadmaps/2026-05-25-hunter-setup-readiness-plan.md`
- Official: https://developer.chrome.com/docs/extensions/reference/manifest
- Official: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
- Official: https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers
- Official: https://developer.chrome.com/docs/extensions/reference/api/storage/
- Official: https://developer.chrome.com/docs/extensions/mv3/storage-and-cookies
- Official sources must be refreshed during implementation for every selected extension API, LLM, email, entitlement, Chrome Web Store, and target application provider.
