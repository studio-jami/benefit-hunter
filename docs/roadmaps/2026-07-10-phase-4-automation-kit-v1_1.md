# Benefit Hunter Automation Kit v1.1 Implementation Plan

Date: 2026-07-10
Status: [ ] Planned (non-blocking add-on)
Source reports: `docs/product/setup-kit-and-guided-flow.md`, `_ops/programs/automation/benefits-registry-sync/README.md`
Owner: Jami Studio
Surface: `apps/hunter` docs/kit surface, packaged Apps Script sources, self-serve setup instructions

## Purpose

Ship the "keep your benefits registry updated automatically" capability as a
**self-serve add-on** — a documented, copyable Google Apps Script kit a user installs
in their own Google account against their own Sheet and Gemini key. This is an add-on,
not core to the service, and must not block Phases 2–3. It ships as v1.1 after the core
product is live and will need tuning.

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Complete
- [!] Blocked or needs explicit decision

## Source Findings

- `_ops/programs/automation/benefits-registry-sync/` contains a complete, working
  Apps Script project: `Code.gs`, `GeminiClient.gs`, `GmailProcessor.gs`,
  `SheetManager.gs`, `Logger.gs`, `DevTools.gs`, `appsscript.json`, plus a README.
- It runs on a time trigger, reads Gmail via `GmailApp` as the sheet owner, calls
  Gemini for structured extraction, and idempotently upserts rows into a Google Sheet
  registry (matched by program name), with logging and a dashboard.
- The current version is wired to Jami Studio specifics: a hardcoded target Sheet ID,
  a `VERTEX_SA_KEY` script property pointing at a Jami Studio service account, and
  Jami-specific prompt/schema assumptions (11-column canonical shape, Fin pack
  awareness).
- `_ops/programs/automation/engineering/` holds the schema doc and `registry.seed.csv`.

## Locked Decisions

- The kit is **self-serve**: the user brings their own Google account, Sheet, and
  Gemini/Vertex key. Jami Studio does not run automation on the user's behalf and does
  not receive the user's email or credentials.
- The kit is an **add-on**, presented separately from the core finder; it is not a
  precondition for any core feature.
- No Jami Studio secret, service-account key, or private Sheet ID ships in the kit.
  All Jami-specific values become clearly marked placeholders.
- Presentation format is deferred (see open decision); the packaging and
  de-Jami-fication happen regardless of final placement.

## Scope Boundaries

- Security: the shipped `.gs` sources and docs contain **zero** real keys, real Sheet
  IDs, real service-account paths, or Jami-only assumptions presented as required.
- Product: the kit does not call Jami Studio infrastructure; it is fully standalone in
  the user's Google account.
- No server component; this remains Google-native primitives only.

## Repo Guidance

- Ship the kit as a reviewed, de-identified copy — do not symlink or export directly
  from `_ops/` (which is gitignored/private).
- Keep the original private version intact in `_ops/`; the public kit is a derivative.
- Replace hardcoded Jami values with documented placeholders and a config block.

## Target Product Shape

- A public kit directory (final location per the open decision — likely under
  `apps/hunter/public` as downloadable assets plus a `docs/`/in-app guide) containing:
  - The `.gs` sources, de-identified and parameterized.
  - `appsscript.json`.
  - A step-by-step self-serve setup guide (create Sheet, add script files, set script
    properties for the user's own Gemini key, authorize, install trigger, seed).
  - A sample seed CSV structure (generic, not Jami's real registry).
- A short in-app entry point that frames it as an optional power-user add-on.

## Cross-Stream Dependency Map

- Workstream 1 (de-identify/parameterize) must precede any public placement.
- Workstream 2 (self-serve guide) depends on Workstream 1's config surface.
- Workstream 3 (presentation) depends on the open decision and Workstreams 1–2.
- Workstream 4 (verification) depends on all.

## Workstream 1: De-Identify And Parameterize The Script

Goal: A standalone, secret-free, user-configurable copy of the Apps Script project.

Depends on:

- [ ] Phase 2 baseline live (so the add-on has a home).

Primary areas:

- `_ops/programs/automation/benefits-registry-sync/*` (private source)
- new public kit directory

Implementation tasks:

- [ ] Copy the `.gs` sources into the public kit and remove all Jami-specific values.
- [ ] Replace the hardcoded target Sheet ID and any `VERTEX_SA_KEY`/service-account
      path with documented placeholders and a single config block.
- [ ] Rework the prompt/schema assumptions into a documented, user-editable schema
      (generalize the 11-column canonical shape; remove Fin-pack-only assumptions or
      make them optional).
- [ ] Provide a generic seed CSV structure, not Jami's real registry data.

Exit criteria:

- [ ] The kit contains no real keys, Sheet IDs, SA paths, or Jami-only requirements.

Suggested verification:

- Grep the kit for token/ID/path patterns and `jami`/`yrka` references.

## Workstream 2: Self-Serve Setup Guide

Goal: A user can install the kit in their own Google account end to end.

Depends on:

- [ ] Workstream 1.

Implementation tasks:

- [ ] Write a step-by-step guide: create/copy the Sheet, add each script file, set the
      script property for the user's own Gemini/Vertex key, authorize Gmail+Sheets,
      run the trigger installer, and seed.
- [ ] Document the schedule and how to change it, the idempotency model, and how to
      re-apply canonical formatting.
- [ ] Include a troubleshooting section and a clear privacy statement (runs entirely in
      the user's account; Jami Studio receives nothing).

Exit criteria:

- [ ] A new user can follow the guide without access to any Jami Studio resource.

## Workstream 3: Presentation / Entry Point

Goal: Decide and implement how the add-on is offered.

Depends on:

- [ ] Open decision on presentation (see below).

Implementation tasks:

- [ ] Implement the chosen surface (e.g. a dedicated kit page or downloadable bundle
      plus an in-app callout framing it as optional).
- [ ] Link it clearly as an add-on, separate from the core flow.

Exit criteria:

- [ ] The add-on is discoverable but clearly optional and non-blocking.

## Workstream 4: Verification And Closeout

Implementation tasks:

- [ ] Confirm no secret/Jami-only value in the shipped kit.
- [ ] Confirm the guide is followable standalone.
- [ ] Update this roadmap's checkboxes; retire to `docs/_legacy/roadmaps/` when done.

## Acceptance Criteria

- A secret-free, self-serve Google Apps Script kit is publicly available with a
  followable setup guide, framed as an optional add-on, using no Jami Studio
  infrastructure or credentials.

## Open Decisions

- [!] **Presentation format** — how to best offer/present the kit (dedicated page,
      downloadable bundle, GitHub-linked folder, or in-app guide). Deferred; decide
      before Workstream 3.
- [!] **Schema generality** — how much of the Jami-specific 11-column registry schema
      to keep as a recommended default vs fully generalize.

## Implementation Order

1. Workstream 1 — de-identify and parameterize.
2. Workstream 2 — self-serve guide.
3. Workstream 3 — presentation (after the open decision).
4. Workstream 4 — verification and closeout.

## Expansion Track

- Optional: a non-Google variant (e.g. a small script + cron) if users want to run it
  off Google primitives. Not planned unless demand appears.
