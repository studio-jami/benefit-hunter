# Repo and Monorepo Structure

Status: durable architecture doc
Owner: Jami Studio

Defines the public monorepo shape, what ships vs stays private, app naming, and the
reorg from the Jami Studio admin tree. The dated Phase 2 roadmap holds the executable
steps; this doc holds the durable target and rules.

## Repository

- **Host:** GitHub `studio-jami` org (james@jami.studio identity).
- **Visibility:** public.
- **Local path:** `C:\Users\james\orgs\oss\benefit-hunter`.
- **Deploy:** Vercel (Jami Studio team) → `benefits.jami.studio`. See
  [operations/deployment-and-domains.md](../operations/deployment-and-domains.md).

Because the repo is public, the private admin material is gitignored and the raw
secret files are relocated out of the repo before the first commit. There is no git
history yet, so no secret ever needs to enter version control.

## Target layout

```
benefit-hunter/
├── apps/
│   └── hunter/            # the public Benefit Hunter app (Vite/React static site)
├── docs/                  # this durable docs tree (public)
├── _ops/                  # PRIVATE admin material — gitignored, never shipped
│   ├── marketing/
│   └── programs/          # source-of-truth admin tree (credits, applications, etc.)
├── .gitignore
├── .env.example           # safe placeholder only; real .env is gitignored
└── README.md
```

Monorepo now, single app today. The `apps/` layout leaves room for future siblings
(e.g. `apps/marketing`, `apps/api`) without restructuring.

## App naming

The deployable app is renamed from the scaffolded `apps/web` to **`apps/hunter`**.
Rationale: it is a static finder, not a generic server "web" app, and the brand is
Benefit Hunter. This keeps future siblings unambiguous.

## What is public vs private

| Path | Ships in public repo? | Notes |
| --- | --- | --- |
| `apps/hunter/**` | Yes | The app, its catalog, and public data artifacts. |
| `docs/**` | Yes | Durable docs and active roadmaps. |
| `_ops/programs/**` | No (gitignored) | Real application copy, evidence PDFs, credentials, tooling, live registry. |
| `_ops/**/.env*` | No (gitignored) | Never committed; relocated out of repo. |
| Templatized examples | Yes | De-identified archetypes generated **from** `_ops`, reviewed before they enter `apps/hunter`. |

The public example library is derived from private sources but is a separate,
reviewed, de-identified artifact. Private raw material is never the thing that ships.

## Reorg from the admin tree

The scaffolded repo currently mirrors the Jami Studio admin `programs/` tree under
`_ops/programs/`. Durable rules for reconciling it:

1. **Dedupe Hunter.** Hunter exists twice — as `apps/hunter` (deploy target) and as
   `_ops/programs/hunter/` (archival copy). Remove the archival copy so there is one
   canonical app. Preserve its useful `docs/` (monetization research, prior roadmaps,
   engineering standards) by moving them to `docs/reference/` and `docs/_legacy/`.
2. **Remove nested git repos.** Both `apps/hunter/.git` (was a clone of
   `yrka-io/hunter`) and `_ops/programs/hunter/.git` are removed so the root repo
   tracks everything as plain files. The root becomes the single git repo.
3. **Rebrand.** The app carries "Benefit Hunter" / `benefits.jami.studio`, replacing
   `hunter.yrka.io` and yrka-specific identity in user-facing copy.
4. **Retire the yrka-monorepo roadmaps.** The two `2026-05-25` Hunter-into-Yrka plans
   assumed a pnpm/turbo Yrka monorepo. That direction is superseded by this standalone
   public repo. Keep them as history under `docs/_legacy/roadmaps/`; their reusable
   ideas (extracting a `hunter-core` contract, the human-submit boundary) are carried
   forward into the current roadmaps where relevant.

## Toolchain

- The app keeps its existing npm + Vite workflow (`apps/hunter/package.json`).
- No pnpm/turbo is introduced unless a second app makes a shared workspace worthwhile;
  revisit only when `apps/` gains a real second member.

## Source-of-truth boundaries

- Executable truth: `apps/hunter/src/data/*` (catalog, profile, tags, access, lanes,
  statuses) and any generated data artifacts.
- Durable operating truth: this `docs/` tree.
- Private operational truth (credits, applications, live registry): `_ops/programs/`,
  which is not part of the public product and is gitignored.
