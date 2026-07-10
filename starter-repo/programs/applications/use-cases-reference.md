# Jami Studio - Application Use Cases & Reference

**Purpose:** Durable reference for startup programs, credit applications, grants, vendor intros, and follow-ups. Contains short + long styles for common sections. Used as the source for the ElevenLabs application/follow-up examples in this same directory.

**Instructions:**
- Update this file when product emphasis, traction, or key details change.
- **Partners & Programs** section below is for traction/referral questions only. Do **not** paste the full list into product descriptions or workload sections unless the form explicitly asks about it.
- Adapt language to the specific offer (fast inference, voice, automation, cloud credits, etc.) while keeping core facts consistent.
- Tone: Human, technical founder voice. Specific and concrete. Production intent. Grounded enthusiasm. Not slide-deck or overly aspirational.

---

## Core Identity / Company Summary

### Short (1-2 sentences, for tight form fields)

Jami Studio is an agent-native platform for building and running governed AI agents, with voice as the primary interaction layer. The core is the Jami Agent Harness: a production-grade, self-hostable runtime for planning, tool use, and execution, paired with a real-time voice supervisor that keeps natural conversation going while complex work runs in the background.

### Long (detailed paragraph, for "Share more details", "About us", or longer summaries)

Jami Studio is an open-core agent-native platform for governed, self-hostable AI agents. The foundation is the Jami Agent Harness: a multi-provider runtime that gives developers full control over policies, memory, tools, observability, and model routing. On top sits a real-time conversational voice supervisor that holds natural, barge-in-capable dialogue with users while dispatching tasks, monitoring progress, narrating updates, and taking mid-flight corrections - all without the user ever feeling like they left the conversation.

The full stack includes:
- **Jami Agent Harness** (governed runtime, BYOK/self-host)
- **Studio UI Registry** (tokenized, agent-native components and trusted render contract)
- **Orchestra** (multi-agent coordination + our internal agent-orchestrated development system)
- **Intercal** (provenance-backed temporal knowledge substrate for high-quality, citable grounding)
- **Collectiva** (open agent governance layer)

We're building open-core foundations today with a commercial hosted lane (managed agents, enterprise governance, production support) planned. This is a long-term product family, not a campaign. Active development with real repos, architecture docs, verification, and dogfooding already in place.

---

## Inference / LLM Workloads

### Short style (tight form fields, "short summary", "quick use case")

We build a voice-first governed agent platform. Fast inference powers the real-time voice supervisor (intent understanding, planning, natural narration, and corrections during live conversations) plus live multi-step agent execution inside the Jami Harness (planning, tool calling, orchestration). We also run high-volume batch pipelines in Intercal for provenance-backed knowledge synthesis (ingestion, entity extraction, temporal claims, summarization, contradiction detection) and use fast models heavily for agent evals, synthetic data, multi-agent coordination in Orchestra, and internal development dogfooding. We route deliberately: frontier models for hard reasoning, fast open models for volume, latency, and cost at scale.

### Long / detailed style (main "Share more details about your use case" sections)

We are building a voice-first agent platform where inference is central to both the user-facing experience and the underlying systems.

**Core product surface - real-time voice supervisor:**
A conversational agent holds natural dialogue with the user (STT → understanding → planning → TTS narration and responses) while dispatching and monitoring actual work in the governed Jami Harness runtime in the background. This requires low-latency, high-quality inference for intent classification, dynamic planning, tool selection, progress narration, and mid-conversation corrections/barge-in handling.

**Live agent execution in the Harness:**
Complex, multi-step planning, tool calling, state management, retries, handoffs, and execution for agents the user has launched. These can be long-running or highly parallel. The runtime must feel responsive even when heavy work is happening.

**On-the-fly grounding and synthesis:**
During conversations and agent runs, agents pull relevant, temporally-aware, provenance-backed knowledge from Intercal for accurate, citable answers and decisions.

**Knowledge corpus building (Intercal pipelines):**
Continuous large-scale batch workloads ingesting web sources, papers, and data; entity extraction; temporal claim synthesis; summarization; contradiction detection; and historical backfilling. Thousands of LLM calls per batch to build a high-quality, queryable knowledge base that powers both human surfaces and agent grounding.

**Evaluation, iteration, and synthetic data:**
High-volume agent behavior evals, tool-use accuracy testing, planning quality measurement, voice naturalness checks, and generation of synthetic training/eval data.

**Multi-agent orchestration:**
Orchestra coordinates multiple specialized agents. Inference is used for delegation, synthesis across agents, and coordination logic.

**Development velocity & dogfooding:**
Heavy daily use for code generation, multi-file refactors, test synthesis, architecture work, prompt engineering, and running our own agent systems (Orchestra) to move fast as a small team.

**Future production & reference deployments:**
Users will run governed agents on our platform (self-hosted or hosted). Fast open models will be a first-class, cost-effective path via our multi-provider adapters for production workloads and reference implementations.

We are currently bootstrapped and burning personal + prepaid credits. Reliable, high-throughput fast inference lets us scale live agent experiences, knowledge quality, evals, and velocity without throttling.

---

## Specific Use Cases (bulleted lists)

Use these when a form asks "How will you use X?" or "Tell us about your workload" and bullets are welcome. Pick and adapt the most relevant 4-7 items.

- Real-time voice supervisor loop: intent understanding, dynamic planning, natural progress narration, barge-in handling, and conversational corrections while background work executes in the Harness.
- Live multi-step agent runs: complex planning, tool calling, orchestration, state, and recovery inside user-launched agents in the governed runtime.
- On-the-fly knowledge grounding: retrieving and synthesizing provenance-backed, temporally-aware facts from Intercal during conversations and agent execution.
- Large-scale knowledge corpus pipelines (Intercal): web/paper ingestion, entity extraction, temporal claim synthesis, summarization, contradiction detection, and backfilling.
- High-volume agent evaluation and iteration: behavior evals, tool accuracy, planning quality, and synthetic data generation at scale.
- Multi-agent coordination: delegation, synthesis, and orchestration across specialized agents in Orchestra.
- Internal development dogfooding: codegen, refactors, test synthesis, architecture, and running agent-orchestrated development workflows.
- Reference production deployments: cheap, fast open-model paths for users running real governed agents (self-host or hosted).
- Synthetic data and augmentation for agent training/evals and knowledge improvement.

---

## Model & Provider Strategy

We are deliberately multi-provider.

- Frontier / high-reasoning models for deep planning, complex tool use, and hard reasoning steps.
- Fast open models for volume, low latency, cost efficiency, high-throughput batch work, real-time conversational feel, and reference user deployments.

This routing happens in the Harness via adapters. Fast providers are critical for making the voice supervisor and live agents feel alive and scalable while preserving budget for frontier calls. We also use fast inference heavily for evals and dev velocity.

---

## Partners & Programs (Traction / Referrals)

**Critical rule:** Use this section **only** when the form asks about funding, traction, VCs/affiliations, "other programs you're in", referrals, or similar.

**Do not** dump this list into product descriptions, use-case paragraphs, or "what are you building" answers. Those should stay focused on the technology and workload.

**Current accepted / active / unlocked programs (select the most relevant 3-5 for the specific application):** list your own programs here — see `../benefits/vendors/` for the current per-program status. We are transparent about being bootstrapped and early; many programs like this because credits move the needle on actual shipping and usage.

---

## Common Boilerplate Answers

**How much funding have you raised?**
None / Bootstrapped (pre-seed stage, self-funded)

**How many paying customers do you have today?**
0 (early-stage open-core project with active community, waitlist, and public hub at launch)

**Which VCs are you affiliated with?**
None - bootstrapped (we have been accepted into multiple non-dilutive programs)

**What is your Current Cloud Provider?**
[List your actual stack] — multi-cloud by design to support a self-host / BYOK story. Additional providers under evaluation via startup credits.

**What are your main use cases?** (Select all that apply - adjust per program)
- Inference LLMs
- Training / fine-tuning experiments
- Research
- Data processing
- Other: Agent orchestration, evals, synthetic data generation, code generation, real-time voice agent supervision

**Short summary of company / use case (very tight)**
Jami Studio develops open-source infrastructure for agent-native applications. Core is the Jami Agent Harness (governed multi-LLM runtime for planning/tool-use agents) with a real-time voice supervisor as the primary interface. Workloads include live conversational agent execution, high-volume knowledge synthesis in Intercal, agent evals, multi-agent orchestration, and heavy internal dev dogfooding. Fast open models complement frontier reasoning for volume and latency.

---

## Tone & Principles

- Human, technical founder voice. Specific and concrete.
- Production intent, not slide-deck. Grounded enthusiasm, not hype.
- Lead with the real architecture and workload, not funding narrative.
- Reuse this file's sections rather than rewriting from scratch for every application — consistency across applications makes cross-referencing (referral hubs, T0/T1 programs) easier and faster to write.
