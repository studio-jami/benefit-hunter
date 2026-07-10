# Snowflake Startup Accelerator — Application Archetype

## What this program wants

- **Form shape:** product description, "how will you use Snowflake," team background, optional supporting-document uploads.
- **Tone:** enterprise-credible. Snowflake wants a real *data story* — evidence of data gravity forming and an analytical layer you intend to build properly.
- **What wins:** positioning Snowflake as your analytics/AI layer *alongside* (not replacing) your operational stores, plus 2–4 supporting docs (architecture overview, product README, a simple data-flow diagram). Don't dump everything.

## Templated answers

**Product description**

```
{{company_name}} is {{one_liner}}.

{{description}}

Why Snowflake fits us: we have real data gravity forming fast. [2–3 sentences
naming the data your product accumulates — events, telemetry, corpus,
audit trails — and why it outgrows a single operational database.]

Snowflake is where we want that analytical layer to live: not a replacement
for our operational stores, but the place we build durable, queryable,
customer-valuable data products.
```

**How we'll use Snowflake**

```
- [analytics workload 1 — e.g. product/domain analytics over accumulated data]
- [workload 2 — e.g. usage telemetry and audit rollups for the hosted product]
- [workload 3 — e.g. evaluate Cortex AI for retrieval/summarization workloads]
- [workload 4 — e.g. customer-facing data apps on the AI Data Cloud]

Stack: [languages/frameworks], {{use_case_data}} operationally; Snowflake for
analytics and data products.
```

**About the team**

```
I'm {{first_name}}, {{role_title}} of {{company_name}}. [2–3 sentences of
honest team shape: what exists today — real repos, working subsystems,
pipelines — and why the team is sized the way it is. Confidence without
inflation.]
```

## Notes from a successful application

- The "operational store stays, Snowflake is the analytical layer" division
  of labor reads as architectural maturity — reviewers reward it.
- Upload 2–4 documents max: product overview, architecture doc, one diagram
  (sources → operational DB → Snowflake → dashboards/data apps).
- If you're in other partner programs, offer referral details in the
  partner/referral field — it can help route the application.

## Redraft instructions (hand to your agent verbatim)

> Hydrate from my profile (`company_name`, `one_liner`, `description`,
> `use_case_data`, `first_name`, `role_title`). Replace bracketed workloads
> with real analytical workloads implied by my product — name the data, not
> buzzwords. Keep the enterprise-credible tone; no hype. Then list which 2–4
> of my existing documents I should upload as supporting material.
