# Privacy and Secrets

Status: durable security doc
Owner: Jami Studio

This is a **public repository**. Everything committed is world-readable forever.
These rules are non-negotiable and apply before the first commit and on every change.

## Golden rules

1. **No secrets in the repo, ever.** No tokens, API keys, PATs, service-account keys,
   connection strings, JWTs, passwords, coupon/referral codes, invoice numbers, or
   signed URLs — not in code, docs, fixtures, catalog entries, examples, commit
   messages, or screenshots.
2. **No raw applicant PII.** No real names, emails, phone numbers, personal
   addresses, DOB, EIN/Tax ID, or incorporation identifiers.
3. **The private admin tree does not ship.** `_ops/` is gitignored in its entirety.
4. **Derive, review, then ship.** Public artifacts (example library, real-awards
   view) are generated from private material, de-identified, and reviewed before they
   enter `apps/hunter`.

## Pre-first-commit checklist

There is no git history yet — keep it that way for secrets.

- [ ] Relocate raw secret files (`_ops/programs/.env`, `_ops/programs/.env.canonical`,
      any `.env` with real values) **out of the repo** (e.g. a `~/.secrets` folder or
      the existing legacy admin tree). Do not just gitignore them in place if they can
      be avoided; relocating removes the accident surface.
- [ ] Author `.gitignore` (below) before `git init` / first `git add`.
- [ ] `git status` shows no `.env*` (except `.env.example`) and no `_ops/` content.
- [ ] Grep the staged tree for token-shaped strings before the first push.

## `.gitignore` (root) — required entries

```gitignore
# Private admin tree — never ships
/_ops/programs/
/_ops/marketing/

# Env / secrets
.env
.env.*
!.env.example
**/.env
**/.env.*
!**/.env.example
*.pem
*.key
.gcloud-keys/

# Node / build
node_modules/
dist/
.vercel/

# OS / editor
.DS_Store
desktop.ini
Thumbs.db
```

Notes:
- `_ops/` is ignored at the directory level. If any curated, safe operator note must
  ever be public, promote it into `docs/`, do not un-ignore `_ops/`.
- `.env.example` files are intentionally allowed and must contain only placeholders.

## Nested git repos

The scaffolded tree contains nested `.git` directories (`apps/hunter/.git` from the
original clone; `_ops/programs/hunter/.git`). Remove them before `git init` at the
root so the root repo is the single source of history and no foreign remote/history
leaks in.

## Example-library de-identification

The example library is derived from real submissions. Before an example enters the
public app:

- Replace personal/company identifiers with profile-schema placeholders
  (`{{first_name}}`, `{{company_name}}`, `{{website}}`, `{{ein}}` → omit, etc.).
- Strip every code-like value: referral/coupon codes, portal links, ticket/invoice
  IDs, account IDs, service-account emails.
- Keep the substance and voice generalized to a placeholder archetype — informative,
  not sterilized. See
  [product/setup-kit-and-guided-flow.md](../product/setup-kit-and-guided-flow.md).

## Real-awards artifact

The public real-dollars view carries vendor, value, lane, term, and
`verificationStatus` only. It must not carry redemption links, coupon/referral codes,
invoice IDs, account identifiers, or any credential. See
[architecture/data-and-truth-model.md](../architecture/data-and-truth-model.md).

## Rotation guidance

Because nothing is committed yet, correctly ignoring/relocating secrets means they
never enter history and rotation is optional. However, the raw dump has been copied
between folders loosely; rotating the highest-blast-radius credentials (GitHub PATs,
Vercel token, Supabase secret key, Cloudflare API token, database connection strings)
is recommended as hygiene. If any secret is ever committed and pushed, treat it as
compromised and rotate immediately — removing it in a later commit is not sufficient.

## If a secret leaks

1. Rotate the credential at the provider immediately.
2. Purge it from history (e.g. `git filter-repo`) and force-push, or, if early, delete
   and recreate the repo.
3. Record the incident and the rotation date in `_ops/` (private), not in the public
   repo.
