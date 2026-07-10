# Data and Truth Model

Status: durable architecture doc
Owner: Jami Studio

Defines the app's data contracts, how `active-credits` becomes the source of truth for
real awards, the unverified-claimed corral rule, and the real-dollars-by-stack view.

## Data layers

| Layer | Source | Role |
| --- | --- | --- |
| Catalog | `apps/hunter/src/data/programs.js` | The public universe of ~172 programs a user can qualify for and apply to. Generic value estimates, eligibility, tags, apply URLs, `formConfig.fields`. |
| Profile | `apps/hunter/src/data/profile.js` | 38-field profile document + boolean matching profile; `profileMatches` and `getApplicationReadiness`. |
| Taxonomy | `access.js`, `lanes.js`, `tags.js`, `statuses.js` | Access paths, stack lanes, capability/blocking tags, and per-program status states. |
| Readiness | `src/lib/agent.js`, `src/lib/stats.js` | Readiness classification and totals. |
| Real awards | `active-credits` (private, dated) → generated public artifact | The actual dollars Jami Studio secured, itemized. Feeds the proof view. |

The **catalog** answers "what could you get." The **real awards** answer "what did
Jami Studio actually get." They are distinct and must not be conflated.

## `active-credits` is the source of truth for real awards

The handwritten, dated file `_ops/programs/active-credits-07-10-2026.md` is the latest
**official** partner-credit truth. When it disagrees with any older artifact (the
pipeline status, the registry, the catalog estimates), `active-credits` wins.

Known conflicts to resolve in its favor (examples, verify at build time):
- Confidence / Spotify: use the value in `active-credits`, not the older pipeline figure.
- ElevenLabs: use the `active-credits` value/term, not the older pipeline phrasing.

Several entries in `active-credits` are net-new and not yet in the catalog/pipeline
(e.g. Lightfield, Framer, Galaxy, Bubble, Replit, oro by Tomorro, gravatar, jam).
These are real awards and belong in the real-dollars view even if they are not yet
public catalog programs.

### Build rule

The real-dollars view is generated **from** `active-credits`, reviewed, and committed
as a public, de-identified artifact under `apps/hunter/src/data/` (e.g.
`realAwards.js`). The raw private file stays in `_ops/` and is gitignored. Regenerate
the artifact whenever a newer dated `active-credits` file supersedes the current one.

## The unverified-claimed corral (do not delete)

Some awards in `active-credits` may already be claimed/redeemed, and some may have
slipped the operator's bookmarking. The rule:

- **Never drop a claimed award outright.**
- Every real-award record carries an explicit `verificationStatus`:
  - `official` — confirmed present in the latest `active-credits` truth.
  - `unverified-claimed` — previously tracked/claimed but not confirmed in the latest
    pass; retained in case it was missed.
- The proof view renders `unverified-claimed` items in a clearly separated,
  visually distinct group, labeled as unverified. They still count as history; they
  are just not presented as confirmed live value.

This preserves data integrity: nothing is lost, and the confirmed total is honest.

## Real-dollars-by-stack view

A proof surface that itemizes real awards by stack/feature lane so a visitor sees a
concrete, organized outcome.

- **Grouping:** by stack lane (compute/infra, data stores, AI/LLM inference, product
  analytics, search/retrieval, voice/avatar/media, automation/ops, support,
  legal/finance). Reuse `lanes.js` where possible; extend if `active-credits` needs a
  lane the catalog lacks.
- **Per item:** vendor, award value (real, from `active-credits`), term/expiry if
  known, `verificationStatus`, and a link to the matching catalog program when one
  exists.
- **Totals:** show confirmed (`official`) total prominently; show the
  `unverified-claimed` subtotal separately.
- **Freshness:** display the date of the sourcing `active-credits` file.

## Record shape (proposed)

A minimal shape for the generated real-award artifact, keyed so it can join the
catalog by vendor/program:

```
{
  vendor: "Cloudflare",
  programId: "cloudflare-startup" | null,   // join to catalog when it exists
  lane: "compute",
  value: { label: "$10k", estimate: 10000, cashLike: true },
  term: "12 mo" | null,
  verificationStatus: "official" | "unverified-claimed",
  source: "active-credits-07-10-2026",
  notes: ""                                  // de-identified only; no codes/PII
}
```

Do not carry redemption links, coupon/referral codes, invoice IDs, or account
identifiers into this public artifact. See
[security/privacy-and-secrets.md](../security/privacy-and-secrets.md).

## Valuing plan awards (no guessing)

Dollar-credit awards use the value stated in `active-credits`. Plan/license
awards ("1 yr Business plan", "6 mo free") are valued by these rules,
established 2026-07-10:

- Use the vendor's **public list price**, verified on the vendor's live pricing
  page on the artifact's source date, at the smallest honest basis (1 seat /
  1 member / 1 builder). Cite the page and date in the record's `notes`.
- If the plan is **custom-priced** (no public number — e.g. Amplitude Growth),
  set `estimate: null` and exclude it from totals. Never estimate.
- **Vendor-stated marketing values** (e.g. Mixpanel's "$145k" program figure)
  may be quoted in `notes` but never counted in totals.
- Discounts are valued as stated savings; if annualized, say so in `notes`.
- When only a conservative **floor** is computable (e.g. Auth0's 100k-MAU tier
  is custom but the lowest published tier is not), use the floor and label it.

These invariants are locked by the focused tests in
`apps/hunter/src/test/realAwards.test.js` (totals reconcile, statuses valid,
lanes known, no links/codes/PII, uncounted awards carry notes) and
`apps/hunter/src/test/examples.test.js` (placeholders resolve to profile keys,
no identity/referral-code leakage).

## Drift control

- The public artifacts (catalog, real awards) are the shipped truth. Do not duplicate
  volatile status tables into durable docs.
- When `active-credits` changes, regenerate the artifact and update its `source` date;
  do not hand-edit individual dollar values in the app data to chase the sheet.
- Verify vendor-facing claims (value, eligibility, term) against official provider
  sources before promoting a change, per the docs standards freshness rule.
