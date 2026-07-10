# Anthropic — Claude for Startups Application Archetype

## What this program wants

- **Form shape:** short form (~2 minutes): company basics, founding date, venture-backed yes/no, "what are you building," and a critical "how will you use Claude / the API" field.
- **Tone:** specific and workload-centric. The reviewers are technical.
- **What wins:** concrete, named workloads (not "we use AI"), evidence you already use Claude in production patterns, and a traction section listing other startup programs that accepted you — acceptances compound.
- **Prerequisites:** apply from the developer Console account (not the consumer app), with your company-domain email and live website.

## Templated answers

**Brief description of what you are building**

```
{{company_name}} is {{one_liner}}.

{{description}}

Stage: {{product_stage}}. Founded {{founded_date}}. Website: {{website}}.
```

**How do you plan to use Claude / the API? (critical — be specific)**

```
{{use_case_ai}}

Concretely, Claude powers:
- [workload 1 — e.g. multi-file code synthesis / refactors in our core product]
- [workload 2 — e.g. agent planning, tool-calling, and structured output]
- [workload 3 — e.g. evals, synthetic data, or batch knowledge pipelines]
- [workload 4 — e.g. prompt caching over long codebase or corpus context]

We currently pay for this usage out of pocket; credits and higher rate limits
convert directly into shipping velocity.
```

**Traction / other programs (leverage — list only real acceptances)**

```
Accepted programs to date: [list programs you have actually been accepted to,
with award sizes — e.g. "$X credits active" — most impressive first].
Funding status: {{stage}}. Accelerator: {{accelerator}}.
```

## Notes from a successful application

- List every real program acceptance you hold; the credibility stack matters
  more than funding status for bootstrapped applicants.
- If a partner/VC referral is available it can route you to a higher tier —
  mention the affiliation in the notes field, never paste referral codes into
  public materials.
- Re-verify current terms on the official program page before submitting.

## Redraft instructions (hand to your agent verbatim)

> Fill this template from my profile document. In the "how will you use
> Claude" answer, replace the bracketed workload bullets with 3–5 real,
> specific workloads derived from `use_case_ai` and `use_case_general` —
> name the tasks, not the aspiration. Keep the founder voice: technical,
> grounded, production intent. Do not invent traction; only include programs
> and numbers I confirm.
