# Benefit Hunter Repo Standup And Launch Implementation Plan

Date: 2026-07-10
Status: [ ] Active
Source reports: `docs/product/vision-and-scope.md`, `docs/architecture/repo-and-monorepo.md`, `docs/security/privacy-and-secrets.md`
Owner: Jami Studio
Surface: `C:\Users\james\orgs\oss\benefit-hunter`, GitHub `studio-jami`, Vercel Jami Studio team, `benefits.jami.studio`

## Purpose

Turn the scaffolded folder into a clean, public monorepo and ship the **current**
Hunter app live at `benefits.jami.studio` — rebranded, de-duplicated, and free of any
secret exposure. This phase does not add the guided flow, example library, real-awards
view, or automation kit; it establishes a safe, deployed baseline that later phases
build on.

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Complete
- [!] Blocked or needs explicit decision

## Source Findings

- The folder `benefit-hunter/` exists with `apps/web` (a Hunter clone of
  `yrka-io/hunter`), an empty `docs/`, an empty `_ops/marketing/`, and a full copy of
  the admin tree at `_ops/programs/`. It is **not** a git repo yet.
- Two nested `.git` dirs exist: `apps/web/.git` and `_ops/programs/hunter/.git`.
- Hunter is duplicated: `apps/web` (intended deploy target) and `_ops/programs/hunter`.
- Live secrets exist in `_ops/programs/.env` and `_ops/programs/.env.canonical`
  (GitHub PATs, Vercel token, Supabase secret, Cloudflare, Neon, MongoDB, etc.).
- The app is a Vite/React static site with npm; `dist` output; optional Supabase sync
  that is off by default for signed-out users.
- User-facing identity currently references Benefit Hunter/`hunter.yrka.io`; target is
  Benefit Hunter/`benefits.jami.studio`.

## Locked Decisions

- Public GitHub repo `studio-jami/benefit-hunter`; deploy via Vercel Jami Studio team.
- Deployable app path is `apps/hunter` (renamed from `apps/web`).
- `_ops/` is gitignored in full; raw `.env*` files are relocated out of the repo
  before `git init`.
- Launch is local-storage only; Supabase sync/auth stays disabled.
- No paid/Stripe/auth code ships this phase.
- Nested `.git` dirs are removed; the root becomes the single repo.
- The `2026-05-25` Hunter-into-Yrka roadmaps retire to `docs/_legacy/roadmaps/`.

## Scope Boundaries

- Security: no secret enters git; verify before first commit and before first push.
- Product: no new user features beyond rebrand and cleanup this phase.
- Data: catalog ships as-is; no value edits, no real-awards artifact yet.
- Auth/DB: no Supabase env in Vercel; sync path stays dormant.
- Routing: only the canonical domain plus any temporary-preview redirect.

## Repo Guidance

- Keep the app's existing npm/Vite workflow; do not introduce pnpm/turbo yet.
- Do not un-ignore `_ops/`. Promote anything that must be public into `docs/`.
- Keep rebrand changes surgical and confined to user-facing copy/config; do not
  refactor app internals in this phase.
- Use Windows-native commands.

## Target Repository Shape

- `apps/hunter/` — the renamed, rebranded app (was `apps/web`).
- `docs/` — this durable doc set (already authored in Phase 1).
- `docs/_legacy/roadmaps/` — the two retired `2026-05-25` yrka plans.
- `docs/reference/` — carried-over research (e.g. `monetization.md`).
- `_ops/` — gitignored private tree.
- Root `.gitignore`, `.env.example`, `README.md`.

## Cross-Stream Dependency Map

- Workstream 1 (secret safety) must complete before Workstream 5 (git init) — nothing
  is committed until the tree is clean.
- Workstream 2 (dedupe/rename) and Workstream 3 (rebrand) can proceed in parallel
  after Workstream 1.
- Workstream 4 (docs placement) depends on the Phase 1 docs existing.
- Workstream 5 (git + GitHub) depends on 1–4.
- Workstream 6 (Vercel + domain) depends on 5.
- Workstream 7 (verification/closeout) depends on 6.

## Workstream 1: Secret Safety And Ignore Setup

Goal: Guarantee no secret or private material can enter git history.

Depends on:

- [ ] Nothing (do this first).

Enables:

- [ ] Workstream 5 git initialization.

Repo guidance:

- Relocate rather than only ignore raw secret files where possible.

Primary areas:

- `_ops/programs/.env`, `_ops/programs/.env.canonical`, any `**/.env`
- root `.gitignore`

Implementation tasks:

- [ ] Relocate raw secret files out of `benefit-hunter/` to a non-repo location.
- [ ] Author root `.gitignore` per `docs/security/privacy-and-secrets.md`.
- [ ] Add a safe root `.env.example` (placeholders only) and confirm
      `apps/hunter/.env.example` is placeholder-only.

Exit criteria:

- [ ] No real `.env*` remains in the tree except `.env.example` files.
- [ ] `_ops/` is fully covered by `.gitignore`.

Suggested verification:

- `Get-ChildItem -Recurse -Force -Filter ".env*"`
- Manual grep for token-shaped strings across the non-ignored tree.

## Workstream 2: Dedupe And Rename The App

Goal: One canonical app at `apps/hunter`; remove archival/nested duplicates.

Depends on:

- [ ] Workstream 1.

Enables:

- [ ] Workstream 3 rebrand, Workstream 5 git init.

Primary areas:

- `apps/web` → `apps/hunter`
- `_ops/programs/hunter/`
- nested `.git` directories

Implementation tasks:

- [ ] Rename `apps/web` to `apps/hunter`.
- [ ] Remove `apps/hunter/.git` and `_ops/programs/hunter/.git`.
- [ ] Move useful docs out of `_ops/programs/hunter/docs/` into `docs/reference/`
      (research) and `docs/_legacy/roadmaps/` (dated plans), then remove the
      duplicate `_ops/programs/hunter/` app copy.

Exit criteria:

- [ ] Exactly one Hunter app exists, at `apps/hunter`, with no nested `.git`.

Suggested verification:

- `Get-ChildItem -Recurse -Force -Filter ".git"`
- `npm --prefix apps/hunter install; npm --prefix apps/hunter run build`

## Workstream 3: Rebrand To Benefit Hunter / benefits.jami.studio

Goal: Replace yrka identity in user-facing copy and config.

Depends on:

- [ ] Workstream 2.

Primary areas:

- `apps/hunter/index.html`, `apps/hunter/README.md`
- `apps/hunter/src` user-facing strings, meta tags, titles
- any hardcoded `hunter.yrka.io` references

Implementation tasks:

- [ ] Update page title, meta description, and any brand strings to Benefit Hunter.
- [ ] Replace `hunter.yrka.io` and yrka funnel links with `benefits.jami.studio` /
      `www.jami.studio` where user-facing.
- [ ] Update `apps/hunter/README.md` for the new repo/deploy context.

Exit criteria:

- [ ] No user-facing yrka references remain; build still succeeds.

Suggested verification:

- Grep for `yrka` under `apps/hunter/src` and root app files.
- `npm --prefix apps/hunter run build`

## Workstream 4: Place The Docs

Goal: The durable doc set lives at `docs/` with retired plans in `_legacy`.

Depends on:

- [ ] Phase 1 docs authored.

Implementation tasks:

- [ ] Copy the Phase 1 doc set into `docs/`.
- [ ] Place the two `2026-05-25` yrka plans in `docs/_legacy/roadmaps/`.
- [ ] Place `monetization.md` and other carried research in `docs/reference/`.
- [ ] Ensure `docs/README.md` links resolve.

Exit criteria:

- [ ] `docs/` index and links are correct; no dead links.

## Workstream 5: Git And GitHub

Goal: Initialize the single public repo and push a clean first commit.

Depends on:

- [ ] Workstreams 1–4.

Repo guidance:

- Do not `git add` until Workstream 1 exit criteria pass.

Implementation tasks:

- [ ] `git init` at the repo root; set default branch.
- [ ] Stage and review; confirm no `_ops/` or `.env*` (except examples) is staged.
- [ ] Create `studio-jami/benefit-hunter` (public) and set the remote.
- [ ] Commit and push the baseline.

Exit criteria:

- [ ] Public repo exists with a clean baseline and no secret in history.

Suggested verification:

- `git status --short`
- `git --no-pager log --stat -1`
- Confirm on GitHub that `_ops/` and `.env` are absent.

## Workstream 6: Vercel And Domain

Goal: `benefits.jami.studio` serves the app from the Jami Studio Vercel team.

Depends on:

- [ ] Workstream 5.

Implementation tasks:

- [ ] Import `studio-jami/benefit-hunter` into the Jami Studio Vercel team.
- [ ] Set Root Directory `apps/hunter`, framework Vite, build `npm run build`,
      output `dist`.
- [ ] Add `benefits.jami.studio` as a custom domain; set the Cloudflare DNS record.
- [ ] Do not add Supabase envs (sync stays off).
- [ ] Add a redirect from any temporary preview host to the canonical domain.

Exit criteria:

- [ ] `https://benefits.jami.studio` serves the rebranded app over HTTPS.

Suggested verification:

- Load the domain; confirm catalog renders and local-storage status works.
- Confirm no console errors from missing Supabase envs.

## Final Verification And Closeout

- [ ] Build passes locally and on Vercel.
- [ ] No secret or `_ops/` content in the repo or history.
- [ ] Rebrand complete; domain live.
- [ ] Docs placed; retired plans in `_legacy`.
- [ ] This roadmap's checkboxes updated truthfully; retire to
      `docs/_legacy/roadmaps/` when Phase 2 is complete.

## Acceptance Criteria

- The current Benefit Hunter app is public at `studio-jami/benefit-hunter` and live at
  `benefits.jami.studio`, with local-storage persistence, correct branding, a clean
  monorepo layout, and zero secret exposure.

## Implementation Order

1. Workstream 1 — secret safety and ignores.
2. Workstream 2 — dedupe and rename.
3. Workstream 3 — rebrand.
4. Workstream 4 — place docs.
5. Workstream 5 — git and GitHub.
6. Workstream 6 — Vercel and domain.
7. Final verification and closeout.

## Expansion Track

- Phase 3 folds in the guided flow, example library, and real-awards view.
- Phase 4 ships the self-serve automation kit.
