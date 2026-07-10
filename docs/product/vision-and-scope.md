# Benefit Hunter — Vision and Scope

Status: durable product doc
Owner: Jami Studio

## What it is

Benefit Hunter is a free public tool that removes the activation energy between a
founder and the startup benefit programs they already qualify for. It combines:

1. A **finder** — a searchable, filterable catalog of credit, license, and discount
   programs, matched against a lightweight profile so a user sees the specific
   programs and total dollar value they qualify for.
2. A **setup kit** — a guided, umbrella-first flow that tells a founder which
   programs to apply to first and in what order, so referral leverage compounds.
3. An **example library** — real, successful application copy (templatized) that a
   founder can hand to their own coding agent and redraft to fit their project.
4. A **proof layer** — the real dollar value Jami Studio actually secured, organized
   by stack and feature, so the tool is backed by lived results rather than theory.

It lives at `benefits.jami.studio` and is a free marketing funnel into Jami Studio
(`www.jami.studio`).

## Who it serves

- Early-stage founders and solo builders who need infrastructure, AI, and tooling
  credits but do not know which programs exist, which they qualify for, or how to
  apply efficiently.
- Builders who work with coding agents and want ready-to-adapt application material
  rather than a blank page.

## Why it exists (the funnel thesis)

The value is not the list — lists can be scraped. The value is removing activation
energy: personalized qualification, a correct application order, and proven copy to
start from. That usefulness earns attention and trust, which is the top of the
Jami Studio funnel. Benefit Hunter demonstrates how Jami Studio operates (real
programs, real dollars, real agent workflows) and invites users deeper.

## Scope: now

- Public, client-only web app (Vite/React), deployed as a static site.
- Local-storage persistence only. No account, no auth, no server database at launch.
- Catalog, profile matching, readiness, guided flow, example library, and the
  real-dollars-by-stack view all run client-side from versioned data artifacts.
- The self-serve automation kit ships as a documented, optional add-on — see
  [automation-kit-guide.md](./automation-kit-guide.md).

## Scope: explicitly on hold

- **Paid features, Stripe products, and any billing.** Parked. A clean seam is kept
  (see [future monetization](#future-monetization-parked)) so it can be added later
  without a rewrite, but no checkout, pricing, or entitlement code ships now.
- **Accounts and auth.** The current app has optional Supabase sync; it stays
  disabled for the public launch. Local storage is the only persistence.
- **Server-side form automation / headless submission.** Not a product direction.
  If an agent/autofill capability is ever built, the boundary is: the tool drafts
  and fills, the human reviews and submits.

## Non-goals

- Not a scraper-as-a-service or a raw data resale product.
- Not a CRM or a full application-tracking SaaS.
- Not a replacement for reading each program's actual terms; the tool points to the
  official apply/marketing URLs and discloses freshness and any referral relationship.

## Product principles

1. **Show the number.** The strongest moment is a specific, personalized total —
   "you qualify for $X in credits." Earn the click with specificity.
2. **Umbrella first.** Always steer users to multi-vendor packs and referral hubs
   before one-off solo programs, because acceptance there unlocks downstream partners.
3. **Proof over theory.** Every claim is backed by the real awards Jami Studio
   secured, sourced and dated, with a clear freshness posture.
4. **Human submits.** The tool reduces effort; it never impersonates the user or
   auto-submits. This keeps the product defensible and trustworthy.
5. **Truthful and disclosed.** Values, eligibility, freshness, and any referral or
   affiliate relationship are sourced or clearly labeled.

## Future monetization (parked)

Kept as a design seam only, not built now:

- Light auth + cross-device profile sync (re-enable the existing Supabase path).
- Stripe products for premium surfaces (e.g. saved application packets, weekly
  digest, approval-rate insights, cohort/white-label for accelerators).
- Entitlement gating behind an app-owned adapter.

The decision to build any of these is deferred and revisited only if it is sensible
and smooth. See [operations/deployment-and-domains.md](../operations/deployment-and-domains.md)
for how the launch keeps that path open without carrying its complexity.
