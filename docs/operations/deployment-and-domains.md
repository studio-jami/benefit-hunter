# Deployment and Domains

Status: durable operations doc
Owner: Jami Studio

How Benefit Hunter is hosted, deployed, and routed. The dated Phase 2 roadmap holds
the one-time standup steps; this doc holds the durable operating configuration.

## Accounts

| Concern | Value |
| --- | --- |
| GitHub org | `studio-jami` (identity james@jami.studio) |
| GitHub repo | `studio-jami/benefit-hunter` (public) |
| Vercel team | Jami Studio team |
| Production domain | `benefits.jami.studio` |
| Studio site (funnel target) | `www.jami.studio` |

DNS for `jami.studio` is managed in Cloudflare (Jami Studio account). The
`benefits` subdomain points at Vercel.

## Build configuration (Vercel)

The app is a static Vite/React build.

- **Root directory:** `apps/hunter`
- **Framework preset:** Vite
- **Install command:** `npm install`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node:** current Vercel default LTS (no server runtime needed; static output).

Because the deployable app lives in a monorepo subdirectory, set the Vercel project's
**Root Directory** to `apps/hunter` so install/build run there.

## Environment variables

- Launch posture is **local-storage only**; no runtime secrets are required for the
  public app.
- The Supabase sync path exists in the code but stays **disabled** at launch. Do not
  set Supabase env vars in the Vercel project until/if sync is intentionally enabled.
- Only ever expose public browser keys (publishable/anon) if sync is later turned on.
  Never place secret keys, service-role keys, or provider secrets in the app or in
  Vercel envs for this static site.
- `apps/hunter/.env.example` documents the optional public vars; the real `.env` is
  gitignored.

## Domain routing

- `benefits.jami.studio` → Vercel production deployment of `studio-jami/benefit-hunter`.
- In-app external links use `www.jami.studio` for the studio funnel and the official
  vendor apply/marketing URLs from the catalog.
- If a temporary Vercel preview domain is used pre-cutover, add a redirect to the
  canonical `benefits.jami.studio` once the custom domain is live.

## Analytics

The app already includes `@vercel/analytics` and `@vercel/speed-insights`. These are
privacy-light and fine to keep for a public marketing surface. Any product-telemetry
beyond Vercel's built-ins must be opt-in and disclosed; do not add heavy tracking to
the funnel without a decision.

## Release flow

1. Merge to the default branch on `studio-jami/benefit-hunter`.
2. Vercel builds `apps/hunter` and deploys to `benefits.jami.studio`.
3. Data changes (catalog, real-awards artifact) ship as normal commits; there is no
   separate data pipeline at launch.

## Future (parked) infrastructure

If paid features are ever built (deferred), the additions would be: re-enable the
Supabase auth/sync path, add a small authenticated API surface, and add Stripe. None
of that is provisioned now. Keep the static-first shape until that decision is made.
See [product/vision-and-scope.md](../product/vision-and-scope.md).
