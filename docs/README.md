# Benefit Hunter Docs

Durable documentation for **Benefit Hunter** — a free public tool and setup kit that
helps founders find, qualify for, and apply to startup benefit programs (credits,
community licenses, discounts). It runs at `benefits.jami.studio` and acts as a
free marketing funnel into Jami Studio.

This `docs/` tree is the durable operating layer. The live app under `apps/hunter`
and the generated data artifacts own executable truth. The private admin material
under `_ops/` is gitignored and never ships.

## How to read this

Start with product vision, then architecture, then the dated roadmaps that hold the
active build sequence.

| Area | Doc | Purpose |
| --- | --- | --- |
| Product | [product/vision-and-scope.md](./product/vision-and-scope.md) | What Benefit Hunter is, who it serves, free-now / paid-later posture, funnel goal. |
| Product | [product/setup-kit-and-guided-flow.md](./product/setup-kit-and-guided-flow.md) | The guided umbrella-first application flow and the agent-pointable example library. |
| Product | [product/automation-kit-guide.md](./product/automation-kit-guide.md) | Self-serve setup guide for the optional Google Apps Script registry-sync add-on. |
| Architecture | [architecture/repo-and-monorepo.md](./architecture/repo-and-monorepo.md) | Monorepo shape, app naming, what is public vs private, reorg from the admin tree. |
| Architecture | [architecture/data-and-truth-model.md](./architecture/data-and-truth-model.md) | Catalog schema, `active-credits` as source of truth, the unverified-claimed corral, the real-dollars-by-stack view. |
| Operations | [operations/deployment-and-domains.md](./operations/deployment-and-domains.md) | GitHub `studio-jami`, Vercel Jami Studio team, `benefits.jami.studio`, build config, redirects. |
| Security | [security/privacy-and-secrets.md](./security/privacy-and-secrets.md) | Public-repo secret policy, gitignore rules, example templatization/redaction rules. |
| Roadmaps | [roadmaps/](./roadmaps) | Dated, active implementation plans. Retire to `_legacy/roadmaps/` when done. |

## Build phases

The roadmaps sequence the work. Do not start a later phase before the earlier one's
acceptance criteria are met.

1. **Phase 2 — Stand up & launch** ([retired roadmap](./_legacy/roadmaps/2026-07-10-phase-2-standup-and-launch.md), complete 2026-07-10): cut the public repo, dedupe/rebrand the Hunter app, ship the current app live at `benefits.jami.studio`.
2. **Phase 3 — Fold in the offerings** ([retired roadmap](./_legacy/roadmaps/2026-07-10-phase-3-offerings-fold-in.md), complete 2026-07-10): setup kit, guided umbrella-first flow, templatized example library, real-dollars-by-stack view.
3. **Phase 4 — Automation kit v1.1** ([retired roadmap](./_legacy/roadmaps/2026-07-10-phase-4-automation-kit-v1_1.md), complete 2026-07-10): the self-serve Google Apps Script registry-sync add-on. Non-blocking; ships after core.

(Phase 0 alignment and Phase 1 doc authoring are this doc set itself.)

## Conventions

- Follow the planning-style and docs-standards in `docs/engineering/`. Roadmaps are
  dated and retire to `docs/_legacy/roadmaps/`.
- Never write tokens, credentials, private source URLs, or raw applicant PII into
  any doc, fixture, catalog entry, or example. See
  [security/privacy-and-secrets.md](./security/privacy-and-secrets.md).
- Refer to the product as **Benefit Hunter** and the studio as **Jami Studio**
  (capitalized, with a space). Use `benefits.jami.studio` for the app domain and
  `www.jami.studio` for the studio site; preserve `jami.studio` only in email
  addresses.
