# Partner Credit And Benefit Map

Status: active source  
Owner: Jami Studio

The live status, evidence, redemption links, exact terms, and application queue stay in the startup-program inventory under `_ops/admin/programs`. This map answers a different question: which responsibility lane each credit can power, and how it should influence GTM/system strategy.

## Strategy

1. Use umbrella and referral-hub benefits first because they unlock downstream partners.
2. Spend credits on reversible acceleration: dev inference, support deflection, analytics, search, automation, and demos.
3. Do not make production depend on expiring credits.
4. Do not burn commercial megastacks before the commercial surface exists.
5. Treat accepted benefits as proof points in later applications.

## Lane map

| Responsibility lane | Current / likely benefit pool | GTM use | Activation posture |
| --- | --- | --- | --- |
| Source, CI, security | GitHub for Startups, Copilot, Advanced Security, Actions. | Public OSS credibility, contribution workflow, verification, agent coding power. | High priority; claim as soon as welcome/access lands. |
| Edge hosting and web surfaces | Cloudflare, Vercel. | Static marketing/docs surfaces, waitlist, web demos, lightweight workers. | Use for public surfaces; keep deployment portable. |
| Batch compute and reference deploys | DigitalOcean, RunPod, NVIDIA partner credits, Nebius paths. | Intercal workers, eval jobs, demos, GPU experiments. | Use after workloads exist; avoid idle burn. |
| Data stores | Neon, Supabase, Snowflake, Confluent. | Product data, event streams, future analytics plane. | OLTP first; streaming/warehouse only when event volume justifies. |
| Search and retrieval | Algolia, Massive, Reducto, Snowflake where relevant. | Docs/site search, registry search, document parsing, Intercal ingestion. | Activate against real corpus and indexing plan. |
| Dev inference and coding power | Anthropic, OpenAI/Ramp, Groq, Together, Fireworks, OpenRouter, xAI, Cerebras, Hugging Face. | Agent coding, evals, product demos, model routing tests, synthesis. | Highest near-term gap; prioritize credits that expand SOTA access. |
| Voice, avatar, and media | ElevenLabs, Anam, Mux, media-generation providers. | Conversational supervisor demos, voice/avatar showcase, launch media. | Use when demo surface is ready; avoid vanity demos. |
| Product analytics | PostHog, Amplitude, Confidence/Snowflake path. | Activation, funnel, telemetry, feature validation. | Active once consent-safe events exist. |
| Marketing and lifecycle messaging | SendPulse, Resend-compatible email lane, partner newsletter tools. | Waitlist, launch announcements, onboarding sequences. | Start lean; do not build a content factory. |
| Automation and internal ops | Make, Retool, Miro, Sentry. | Credit burn-down, dashboards, admin tools, incident notifications, planning boards. | Use to remove repeated manual work; never as source truth. |
| Support | Intercom/Fin, AgentMail later, GitHub Discussions/Issues. | Docs-first deflection, hosted-lane support, AI triage. | GitHub/email first; Intercom/Fin once hosted users exist. |
| Legal, finance, entity | Stripe Atlas, Mercury, Termly/TermsFeed-style generators, CPA/legal review. | Eligibility dossier, billing readiness, policy generation, banking. | Execute at commercial activation with professional review for entity/tax. |

## Referral hierarchy

| Tier | Examples | Use |
| --- | --- | --- |
| Umbrella packs | Fin AI Startup Pack and similar multi-vendor programs. | Redeem first; they create partner proof and broad optionality. |
| Referral hubs | Retool, GitHub, Amplitude, Intercom/Fin. | Cite in applications where partner affiliation improves tier or trust. |
| Direct solo programs | Algolia, Make, Snowflake, DO, LLM providers, media providers. | Apply when product proof matches the program's lane. |
| Inventory only | Personal subscriptions, short trials, small promo credits. | Track for runway awareness; do not design systems around them. |

## High-leverage near-term targets

| Target class | Why it matters |
| --- | --- |
| LLM and coding-agent credits | Directly offsets the current SOTA access bottleneck and increases agent throughput. |
| GitHub startup access | Improves OSS operations, security posture, and agent coding capacity. |
| Support AI credits | Lets hosted support scale without making James the queue. |
| Automation credits | Turns registry, evidence, burn-down, and launch chores into durable workflows. |
| Search/retrieval credits | Powers docs, registry, Intercal ingestion, and agent-grounded knowledge surfaces. |

## Burn-down rules

- Record award, start date, expiration, redemption status, owner account, and lane in the live registry.
- Attach evidence in the owning evidence directory, not in this canon.
- Schedule reminders before expiration only after credits are active.
- If a credit requires architecture lock-in, treat it as eval-only unless the platform is already the right long-term default.
- When a benefit expires, update the live registry and leave this map unchanged unless the lane strategy changes.

