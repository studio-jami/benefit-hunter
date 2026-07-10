# Hunter Into Yrka Setup And Readiness Implementation Plan

Date: 2026-05-25
Status: [ ] Active
Source reports: `docs/research/monetization.md`
Owner: Yrka
Surface: `C:\Users\james\projects\hunter`, `C:\Users\james\projects\yrka`, Yrka marketing route, Yrka web auth/API, Yrka Supabase project, shared Hunter domain packages, extension-readiness contracts

## Purpose

Move Benefit Hunter into Yrka now, while it is still small, so the public funnel, account creation, database, extension-readiness contracts, and future monetization live in the right product system from the start. This plan retires the standalone Hunter app as the target architecture. It ports the finder into Yrka as a first-class public route, moves persistence to the Yrka Supabase project, and creates shared domain contracts for future extension work. It must not implement extension runtime, in-page autofill, LLM drafting, remote/headless form automation, or automated submissions.

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Complete
- [!] Blocked or needs explicit decision

## Source Findings

- `C:\Users\james\projects\hunter` is a compact Vite/React prototype with a static catalog in `src/data/programs.js`, profile/readiness logic in `src/data/profile.js`, readiness labels in `src/lib/agent.js`, and Supabase state in `src/lib/remoteState.js`.
- Hunter's current database shape is small and isolated: `hunter_user_state` plus the additive `accents` column in migrations `20260525185515_hunter_user_state.sql` and `20260525190000_add_accents_column.sql`.
- Hunter currently points at Supabase project `klsiyqvrkpvocjtkrdhx`; Yrka's configured target is `fmzmkrogpibarebvukim`.
- `C:\Users\james\projects\yrka` is a pnpm/turbo monorepo with `apps/marketing`, `apps/web`, `apps/boardrune`, `packages/auth`, `packages/db`, `packages/ui`, `packages/design-tokens`, and Supabase migrations under `supabase/migrations`.
- `apps/marketing` is the public Next.js app for `www.yrka.io`/`yrka.io`. Its route ownership docs say marketing owns public product and SEO nouns.
- `apps/web` is the authenticated Next.js app for `app.yrka.io`. It already owns Supabase SSR auth, signup, session sync, billing routes, and protected API surfaces.
- `docs/engineering/route-ownership.md` says `apps/marketing/next.config.mjs` redirects app-owned routes such as `/auth/*`, `/admin/*`, `/employee/*`, and `/schedule/*` to the web app.
- `packages/db/src/client.ts`, `packages/db/src/server.ts`, and `packages/db/src/middleware.ts` use `@supabase/ssr` and `@yrka/db/env` for browser, server, and middleware Supabase clients.
- `apps/web/app/api/auth/session/route.ts` already owns browser-token to SSR-cookie session sync and sign-out.
- `apps/web/app/api/auth/sign-up/route.ts` owns public self-serve signup policy, rate limits, and Supabase account creation.
- `docs/engineering/data-and-auth.md` says new signups provision `profiles`, organization, owner role, employee app access, customer account, and onboarding state through Yrka's auth trigger path.
- `AGENTS.md` enforces migration application, route-access ownership, strict 525-line code health, focused tests, and no Playwright/browser smoke unless explicitly required.
- `docs/research/monetization.md` reframes the later agent direction as extension-assisted autofill with human submit, not remote/headless form automation.
- Official/current source findings used for this direction:
  - Vercel monorepo docs support separate projects per monorepo directory, but this plan avoids a separate Hunter project unless source-truth implementation proves it is needed.
  - Vercel microfrontends path routing exists, but a tiny Hunter route does not need microfrontend complexity if it can be ported cleanly into `apps/marketing`.
  - Supabase session docs and SSR docs confirm cookie/session behavior must be deliberately implemented; same parent domain alone is not a shared-auth guarantee.
  - Chrome extension docs confirm the future extension can use Manifest V3, service workers, content scripts, extension pages/popups, messaging, permissions, and storage after this setup plan creates stable shared contracts.

## Locked Decisions

- The target architecture is Yrka-first, not standalone Hunter-first.
- The canonical public route is `https://www.yrka.io/startup-benefits-finder`.
- The public finder route belongs in `apps/marketing`, not a separate Vite deployment, unless implementation proves the route cannot be ported cleanly.
- Authenticated profile saving, status sync, entitlements, extension APIs, and account handoff belong in `apps/web`.
- Hunter persistence moves to the Yrka Supabase project. Do not keep a separate Hunter auth/database project for the production funnel.
- Hunter's visual identity may remain distinct and locally scoped; it should not force shared marketing design tokens or a broad redesign.
- Shared behavior belongs in packages, not duplicated between marketing, web, and future extension code.
- Extension readiness means contracts only: URL manifests, field maps, sensitive-field blockers, policy gates, and validation. Runtime extension work belongs to the separate extension-agent plan.
- Server-side Playwright/headless browser submission is not a product direction for this setup or the extension MVP.

## Scope Boundaries

- Security: no secrets, OAuth client secrets, service-role keys, signed URLs, private profile data, or raw provider data in docs, client bundles, fixtures, logs, or generated artifacts.
- Database: Yrka migrations must be explicit, RLS-enabled, grant-aware, and verified against the linked target before closeout.
- Auth: use Yrka-owned auth surfaces and `@supabase/ssr`. Do not introduce a second Hunter auth stack.
- Routing: no compatibility detours except explicit redirects from temporary Hunter/Finder hosts to the canonical route.
- SEO: the canonical finder page must be crawlable and included in Yrka marketing metadata, sitemap, and robots posture.
- Product claims: benefit values, eligibility, source freshness, affiliate/referral relationships, and automation claims must be sourced or clearly disclosed.
- Extension readiness: setup may create generated manifests and policy contracts. It must not create browser extension runtime, content scripts, fill engine, LLM calls, queues, or submission paths.
- Billing: setup may create entitlement seams and account handoff requirements. Checkout/pricing implementation belongs to a later monetization plan unless it is already present in Yrka and needed for basic gating.

## Repo Guidance

- Work from `C:\Users\james\projects\yrka` for the implementation. Preserve the current Hunter repo as source input until the port is verified.
- Follow `C:\Users\james\projects\yrka\AGENTS.md`, `docs/engineering/data-and-auth.md`, `docs/engineering/route-ownership.md`, `docs/engineering/testing-standards.md`, `docs/security/service-role-inventory.md`, and `.changes/README.md`.
- Use pnpm and turbo in Yrka; do not bring Hunter's npm/package-lock workflow forward.
- Keep app-authored files below the 525-line strict code-health gate by splitting early.
- Route access belongs in `@yrka/db/route-access`; middleware should not grow ad hoc public-path lists.
- Use `apps/marketing` for public route/SEO implementation, `apps/web` for authenticated API/session/account work, and `packages/*` for shared contracts.
- Migrations must be created in Yrka's `supabase/migrations`, pushed to the configured Yrka target, and verified through Yrka's database scripts.
- Tests should protect catalog/profile/readiness contracts, route/auth/API boundaries, sitemap/metadata inclusion, and migration shape. Do not add brittle UI-label tests.
- Do not run Playwright/browser smoke unless the specific implementation stream requires it or the user asks.

## Target Repository Shape

- `packages/hunter-core`: catalog data, profile document schema, readiness rules, value/stat helpers, source policy, and validation.
- `packages/hunter-extension-contract`: generated extension-safe URL patterns, field metadata, sensitive-field blockers, and fill-policy manifest generated from `hunter-core`.
- `apps/marketing/app/startup-benefits-finder`: public canonical finder route with crawlable content, metadata, and a client island for filtering/profile matching.
- `apps/marketing/app/startup-benefits-finder/[programSlug]`: optional detail pages for high-value opportunities, tips, sources, and future ranking content if included in this setup scope.
- `apps/web/app/api/hunter/profile`: authenticated profile read/write API backed by Yrka Supabase.
- `apps/web/app/api/hunter/statuses`: authenticated application status API backed by Yrka Supabase.
- `apps/web/app/api/hunter/entitlements`: extension/app entitlement read API if needed for paid feature gating.
- `supabase/migrations/*hunter*`: Yrka-target migrations for `hunter_user_state` or its normalized replacement.
- `docs/product/startup-benefits-finder.md`: product positioning, source/disclosure policy, free/paid boundaries.
- `docs/architecture/hunter-integration.md`: marketing/web/package/database/extension-readiness ownership.
- `docs/operations/hunter-launch.md`: migration, route cutover, redirects, Search Console, rollback, and extension-readiness runbook.
- `docs/_legacy` entries for retired standalone-Hunter guidance once the Yrka port is live.

## Cross-Stream Dependency Map

- Workstream 1 locks the Yrka integration target and audits source deltas before code moves.
- Workstream 2 creates shared packages and contract tests consumed by marketing, web, and future extension work.
- Workstream 3 moves database state into Yrka Supabase and is required before authenticated saving can ship.
- Workstream 4 ports the public route into `apps/marketing` using Workstream 2 contracts.
- Workstream 5 adds authenticated web APIs and account handoff using Workstreams 2 and 3.
- Workstream 6 handles route cutover, redirects, and SEO after Workstream 4 is functional.
- Workstream 7 updates durable docs, changelog, and retirement state after the implementation shape is verified.
- Workstream 8 performs final verification, cleanup, commit, and push.

## Workstream 1: Source Audit And Integration Decision

Goal: Replace standalone assumptions with a verified Yrka integration target.

Depends on:

- [ ] Current Hunter source files.
- [ ] Current Yrka route/auth/database docs and code.

Enables:

- [ ] Workstream 2 package extraction.
- [ ] Workstream 3 migration consolidation.
- [ ] Workstream 4 route port.

Repo guidance:

- Treat the Yrka repo as the implementation source of truth and the Hunter repo as source input.

Primary areas:

- `C:\Users\james\projects\hunter`
- `C:\Users\james\projects\yrka\AGENTS.md`
- `C:\Users\james\projects\yrka\docs\engineering\data-and-auth.md`
- `C:\Users\james\projects\yrka\docs\engineering\route-ownership.md`
- `C:\Users\james\projects\yrka\apps\marketing`
- `C:\Users\james\projects\yrka\apps\web`
- `C:\Users\james\projects\yrka\supabase\migrations`

Implementation tasks:

- [ ] Snapshot Hunter source modules, assets, data, migrations, env categories, and current dirty files before moving code.
- [ ] Confirm that `apps/marketing` can own `/startup-benefits-finder` without a separate Vercel microfrontend.
- [ ] Confirm that `apps/web` owns all authenticated Hunter persistence and extension API surfaces.
- [ ] Decide whether program detail pages ship in this setup plan or move to the expansion track.
- [ ] Decide whether Hunter's current `accents` personalization ships in the Yrka port or is retired as prototype-only preference state.
- [ ] Decide whether temporary hosts `finder.yrka.io` and `hunter.yrka.io` redirect immediately at cutover.

Exit criteria:

- [ ] No remaining plan task assumes standalone Hunter deployment, standalone Supabase auth, or Vite base-path routing.

Suggested verification:

- `git status --short`
- `pnpm --version`
- `pnpm list --depth 0`
- `supabase migration list --linked`

## Workstream 2: Shared Hunter Contracts

Goal: Extract Hunter's domain behavior into Yrka-owned packages.

Depends on:

- [ ] Workstream 1 integration decisions.

Enables:

- [ ] Workstream 4 marketing route.
- [ ] Workstream 5 web APIs.
- [ ] Future extension-agent work.

Repo guidance:

- Keep contracts pure and portable. Do not import Next.js, React components, Supabase clients, or app route code into the core package.

Primary areas:

- `packages/hunter-core`
- `packages/hunter-extension-contract`
- `src/data/programs.js`
- `src/data/profile.js`
- `src/lib/agent.js`
- `src/lib/stats.js`

Implementation tasks:

- [ ] Create `@yrka/hunter-core` with TypeScript program, profile, profile document, readiness, status, value, and source-policy contracts.
- [ ] Port and type Hunter's catalog data into `@yrka/hunter-core`.
- [ ] Port profile matching and application readiness into pure, tested functions.
- [ ] Rename readiness labels so `Submit Ready` means user-reviewed autofill readiness, not automatic submission.
- [ ] Create `@yrka/hunter-extension-contract` or an equivalent generated contract surface for URL patterns, canonical fields, sensitive-field blockers, and optional selector override slots.
- [ ] Add validation that fails on duplicate program IDs, invalid URLs, unknown tags/access keys/lanes, missing form fields, stale source metadata, and unsafe extension-readiness metadata.
- [ ] Add focused Vitest coverage for catalog validation, profile matching, readiness policy, and extension manifest generation.

Exit criteria:

- [ ] Marketing, web, and future extension code can consume the same Hunter contracts without importing the old Vite app.

Suggested verification:

- `pnpm --filter @yrka/hunter-core test`
- `pnpm --filter @yrka/hunter-extension-contract test`
- `pnpm check:boundaries`
- `pnpm code-health -- --strict`

## Workstream 3: Yrka Supabase Consolidation

Goal: Move Hunter persistence to Yrka's Supabase project with verified RLS and no standalone auth island.

Depends on:

- [ ] Workstream 1 database decision.
- [ ] Workstream 2 profile/status contracts.

Enables:

- [ ] Workstream 5 authenticated profile/status APIs.

Repo guidance:

- Use Yrka migration workflow and verification scripts. Do not push from the Hunter repo after this stream starts.

Primary areas:

- `supabase/migrations`
- `packages/db/src/database.types.ts`
- `packages/db/src/selects.ts`
- `docs/engineering/data-and-auth.md`
- `docs/security/service-role-inventory.md`

Implementation tasks:

- [ ] Add a Yrka migration for Hunter user state or the chosen normalized equivalent.
- [ ] Preserve user ownership through `auth.users(id)` and RLS policies.
- [ ] Decide whether `profile`, `profile_doc`, `statuses`, and `accents` remain JSONB or split into normalized rows where Yrka integration benefits from relational reporting.
- [ ] Add grants only to the roles that need browser/API access and keep service-role access documented.
- [ ] Add verification SQL or extend `pnpm db:verify` for Hunter tables, columns, RLS, policies, grants, and triggers.
- [ ] Generate/update Supabase types through Yrka's typegen flow.
- [ ] Verify the linked Yrka target after applying the migration.

Exit criteria:

- [ ] Yrka Supabase project owns Hunter persistence and the old Hunter Supabase project is no longer needed for production.

Suggested verification:

- `pnpm db:migrate:dry`
- `pnpm db:migrate`
- `pnpm db:verify`
- `pnpm supabase:types`
- `supabase migration list --linked`

## Workstream 4: Marketing Route Port

Goal: Port the public finder into `apps/marketing` as the canonical SEO/funnel route.

Depends on:

- [ ] Workstream 2 shared contracts.

Enables:

- [ ] Workstream 5 account handoff.
- [ ] Workstream 6 route cutover and SEO.

Repo guidance:

- Keep Hunter's visual language locally scoped. Do not force it into the main marketing component palette unless the route needs shared shell elements.

Primary areas:

- `apps/marketing/app/startup-benefits-finder`
- `apps/marketing/app/marketing-seo*`
- `apps/marketing/app/sitemap.ts`
- `apps/marketing/app/robots.ts`
- `packages/hunter-core`

Implementation tasks:

- [ ] Implement `/startup-benefits-finder` as a Next.js marketing route with crawlable server-rendered content and a client component for interactive filtering/profile matching.
- [ ] Port the Hunter card grid, filters, stats, profile inputs, and local status UX into marketing-owned components split below code-health limits.
- [ ] Keep the route visually distinct with scoped CSS or component styles.
- [ ] Add metadata, canonical URL, Open Graph/Twitter tags, and structured data only where accurate.
- [ ] Add route inclusion to `apps/marketing/app/sitemap.ts` and confirm `robots.ts` allows the page.
- [ ] Add a save/signup CTA after personalized value is computed.
- [ ] Add optional program detail pages only if Workstream 1 chose to ship them now.

Exit criteria:

- [ ] `www.yrka.io/startup-benefits-finder` can render meaningful HTML before hydration and run the interactive finder after hydration.

Suggested verification:

- `pnpm --filter @yrka/marketing typecheck`
- `pnpm --filter @yrka/marketing test`
- `pnpm --filter @yrka/marketing lint`
- `pnpm --filter @yrka/marketing build`

## Workstream 5: Web Auth, Profile Save, And Funnel Handoff

Goal: Make the finder create a real Yrka account and save Hunter state through Yrka-owned auth/API routes.

Depends on:

- [ ] Workstream 2 shared contracts.
- [ ] Workstream 3 Yrka Supabase consolidation.
- [ ] Workstream 4 marketing route shell.

Enables:

- [ ] Future extension profile sync.
- [ ] Paid entitlement and billing handoff.

Repo guidance:

- Use existing `apps/web` auth/session seams. Do not create a second Supabase client/auth model for Hunter.

Primary areas:

- `apps/web/app/api/hunter/profile`
- `apps/web/app/api/hunter/statuses`
- `apps/web/app/api/hunter/entitlements`
- `apps/web/app/api/auth/sign-up/route.ts`
- `apps/web/app/api/auth/session/route.ts`
- `packages/db/src/route-access.ts`
- `packages/auth`

Implementation tasks:

- [ ] Add authenticated Hunter profile and status APIs under `apps/web`.
- [ ] Add route-access classifications and CSRF/content-type protection for the new APIs.
- [ ] Add a marketing-to-web save flow that preserves the computed finder state through signup/login and returns the user to the correct next step.
- [ ] Reuse existing self-serve signup and session sync routes rather than calling Supabase Auth directly from the marketing route.
- [ ] Add an entitlement read contract that can later distinguish free preview, paid autofill, packet export, digest, and premium insights.
- [ ] Add tests for unauthenticated save, authenticated save, ownership isolation, malformed payloads, and status updates.

Exit criteria:

- [ ] A finder signup creates a Yrka user/account in the main Supabase project and can save/reload Hunter profile and statuses.

Suggested verification:

- `pnpm --filter @yrka/web test`
- `pnpm --filter @yrka/web typecheck`
- `pnpm check:boundaries`
- `pnpm db:verify`

## Workstream 6: Routing, Redirects, And SEO Cutover

Goal: Make the canonical route live and retire temporary Hunter hosts without duplicate indexable copies.

Depends on:

- [ ] Workstream 4 marketing route.
- [ ] Workstream 5 account handoff where save/login links are present.

Enables:

- [ ] Launch and Search Console verification.

Repo guidance:

- Prefer direct redirects for old hosts and paths. Use canonical tags only where redirects cannot be applied.

Primary areas:

- `apps/marketing/next.config.mjs`
- Vercel domain/project settings
- `apps/marketing/app/sitemap.ts`
- `apps/marketing/app/robots.ts`
- `docs/operations/hunter-launch.md`

Implementation tasks:

- [ ] Configure redirects from `finder.yrka.io`, `hunter.yrka.io`, and any temporary finder paths to `https://www.yrka.io/startup-benefits-finder`.
- [ ] Confirm marketing-host app redirects do not capture the new public finder route.
- [ ] Confirm app-host marketing redirects send accidental `app.yrka.io/startup-benefits-finder` traffic to the canonical marketing route if needed.
- [ ] Add Search Console inspection steps and post-cutover sitemap verification.
- [ ] Add analytics event names for profile match computed, signup CTA, save attempt, extension CTA, and program outbound click without storing sensitive profile field values.

Exit criteria:

- [ ] There is one canonical indexable finder URL and old hosts/paths consolidate into it.

Suggested verification:

- `pnpm marketing:build`
- `curl https://www.yrka.io/startup-benefits-finder`
- `curl https://www.yrka.io/sitemap.xml`
- `curl -I <old-host-or-path>`
- Search Console URL inspection after deployment.

## Workstream 7: Durable Docs, Changelog, And Standalone Retirement

Goal: Promote permanent rules into Yrka docs and retire standalone Hunter guidance.

Depends on:

- [ ] Workstreams 1 through 6 complete enough to document real behavior.

Enables:

- [ ] Final closeout.
- [ ] Extension-agent plan implementation.

Repo guidance:

- Durable docs explain current operating behavior. Roadmaps should not remain the only source of permanent rules.

Primary areas:

- `README.md`
- `.changes/`
- `docs/architecture/hunter-integration.md`
- `docs/product/startup-benefits-finder.md`
- `docs/operations/hunter-launch.md`
- `docs/engineering/data-and-auth.md`
- `docs/engineering/route-ownership.md`
- `docs/security/service-role-inventory.md`

Implementation tasks:

- [ ] Add architecture docs for marketing/web/package/database/extension-readiness ownership.
- [ ] Add product docs for positioning, source/disclosure policy, free/paid boundaries, and extension-assisted autofill positioning.
- [ ] Add operations docs for migration, route cutover, redirects, Search Console, rollback, and temporary project retirement.
- [ ] Update data/auth and route-ownership docs with the Hunter route/API/table ownership.
- [ ] Add service-role inventory notes only if new server-only access is introduced.
- [ ] Add changelog fragment for route, auth, database, package, and product-surface changes.
- [ ] Mark the standalone Hunter repo/project as retired or source-imported once the Yrka route is verified.

Exit criteria:

- [ ] Future work can start from Yrka docs and source code without reading this roadmap for permanent rules.

Suggested verification:

- `pnpm docs:hygiene`
- `pnpm changelog:check`
- `pnpm format:check`

## Workstream 8: Final Verification And Closeout

Goal: Prove the Yrka-integrated finder works, commit only intentional work, and push.

Depends on:

- [ ] Workstreams 1 through 7 complete.

Enables:

- [ ] Extension-agent work can start from stable Yrka foundations.

Repo guidance:

- Keep staging intentional and stop helpers before final response.

Primary areas:

- Entire Yrka monorepo plus retired Hunter input repo.

Implementation tasks:

- [ ] Run focused package, marketing, web, database, boundary, code-health, docs, changelog, and build verification.
- [ ] Verify signup/save/reload flow against the Yrka auth project.
- [ ] Verify route metadata, sitemap, robots, and redirects.
- [ ] Stop dev servers and long-running helpers.
- [ ] Stage only intentional Yrka changes.
- [ ] Commit with a descriptive conventional-style subject.
- [ ] Push the branch when not blocked.

Exit criteria:

- [ ] Hunter is integrated into Yrka, verified, documented, committed, and pushed.

Suggested verification:

- `pnpm code-health -- --strict`
- `pnpm check:boundaries`
- `pnpm typecheck`
- `pnpm test`
- `pnpm lint`
- `pnpm db:verify`
- `pnpm docs:hygiene`
- `pnpm changelog:check`
- `pnpm build`
- `git diff --check`
- `git status --short`

## Final Verification And Closeout

- [ ] Hunter no longer depends on standalone Vite deployment or standalone Supabase production auth.
- [ ] `@yrka/hunter-core` and extension-readiness contracts are tested.
- [ ] Yrka Supabase migration is applied and verified against the linked target.
- [ ] Marketing route renders crawlable HTML at `/startup-benefits-finder`.
- [ ] Web APIs save and reload authenticated Hunter profile/status state.
- [ ] Route-access, CSRF/content-type, RLS, grants, and service-role posture are verified.
- [ ] Sitemap, robots, metadata, canonical, and redirects are verified.
- [ ] Docs and changelog are updated.
- [ ] No secrets or sensitive profile values appear in docs, logs, fixtures, snapshots, or client bundles.
- [ ] Long-running helpers started during implementation are stopped.
- [ ] Only intentional files are staged, committed, and pushed.

## Acceptance Criteria

- [ ] The canonical finder route lives in Yrka, not as a standalone production app.
- [ ] Hunter uses the Yrka Supabase project and Yrka auth/account surfaces.
- [ ] Public finder UI belongs to `apps/marketing`; authenticated persistence/API work belongs to `apps/web`; shared contracts belong to packages.
- [ ] The route keeps its distinct visual style without forcing shared marketing tokens.
- [ ] The first response for the canonical page has meaningful crawlable content and accurate metadata.
- [ ] Temporary Hunter/Finder hosts or paths do not compete as indexable duplicates.
- [ ] Extension-readiness contracts exist for future work, but no extension runtime, in-page autofill, LLM, queue, remote/headless form automation, or submission work ships in this plan.
- [ ] Durable Yrka docs explain ongoing ownership and operation.
- [ ] The final change set is verified, committed, and pushed.

## Implementation Order

1. Complete Workstream 1 source audit and integration decisions.
2. Build Workstream 2 shared Hunter contracts.
3. Apply Workstream 3 Yrka Supabase consolidation.
4. Port Workstream 4 marketing route.
5. Add Workstream 5 web auth/profile/status APIs and funnel handoff.
6. Implement Workstream 6 routing, redirects, and SEO cutover.
7. Promote Workstream 7 durable docs and changelog.
8. Run Workstream 8 final closeout.

## Expansion Track

- Add individual program detail pages for high-value opportunities, application tips, supporting sources, and eventual approval-rate insights.
- Add monetization and entitlement plan for paid extension autofill, packet exports, digest, managed applications, and accelerator accounts.
- Add `apps/extension` or an equivalent extension package after this setup plan completes.
- Add anonymized aggregate outcome reporting only after privacy and minimum-sample rules are durable.
- Add white-label/co-branded accelerator distribution.

## Sources

- Local Hunter: `package.json`
- Local Hunter: `src/data/programs.js`
- Local Hunter: `src/data/profile.js`
- Local Hunter: `src/lib/agent.js`
- Local Hunter: `src/lib/remoteState.js`
- Local Hunter: `supabase/migrations/20260525185515_hunter_user_state.sql`
- Local Hunter: `supabase/migrations/20260525190000_add_accents_column.sql`
- Local Hunter: `docs/research/monetization.md`
- Local Yrka: `AGENTS.md`
- Local Yrka: `package.json`
- Local Yrka: `pnpm-workspace.yaml`
- Local Yrka: `turbo.json`
- Local Yrka: `apps/marketing/package.json`
- Local Yrka: `apps/marketing/next.config.mjs`
- Local Yrka: `apps/marketing/app/sitemap.ts`
- Local Yrka: `apps/marketing/app/robots.ts`
- Local Yrka: `apps/web/package.json`
- Local Yrka: `apps/web/app/api/auth/session/route.ts`
- Local Yrka: `apps/web/app/api/auth/sign-up/route.ts`
- Local Yrka: `packages/db/src/client.ts`
- Local Yrka: `packages/db/src/server.ts`
- Local Yrka: `packages/db/src/middleware.ts`
- Local Yrka: `docs/engineering/data-and-auth.md`
- Local Yrka: `docs/engineering/route-ownership.md`
- Official: <https://vercel.com/docs/monorepos>
- Official: <https://vercel.com/docs/microfrontends/path-routing>
- Official: <https://supabase.com/docs/guides/auth/sessions>
- Official: <https://supabase.com/docs/guides/auth/server-side>
- Official: <https://developer.chrome.com/docs/extensions/reference/manifest>
- Official: <https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts>
