# Documentation Standards

Durable docs should make the project easier to operate without becoming a
second implementation surface. The live repo remains the source of truth.

## Ownership

- Code contracts, registry fields, workflow mappings, generated schemas, tests,
  and runtime artifacts own executable truth.
- System docs explain ownership, data flow, and execution paths.
- Operations docs explain how to perform a task safely.
- Workflow docs explain a lane's purpose, source family, setup state, and
  runtime expectations.
- Research docs are source reports, not task lists or operating policy.
- Roadmaps hold active implementation steps and retire to `docs/_legacy/`.

## Link Policy

- Prefer links to stable directories and source-owned files.
- Avoid links from durable docs to dated roadmap files. The `docs/roadmaps/`
  directory can hold the active plan; durable docs should not hardcode a dated
  plan as current guidance.
- Legacy links are allowed only when a doc is explicitly describing history.
- Do not add subdirectory README files. Use `docs/README.md` as the docs index.

## Drift Controls

- Do not duplicate registry rows, model rosters, LoRA lists, Comfy node pins,
  or volatile status tables in durable docs.
- If a value is expected to change with setup or runtime status, point to the
  registry, workflow directory, or status artifact instead.
- Verify drift-prone external facts against official provider sources before
  changing model, API, GPU, pricing, licensing, or provider-access claims.
- Do not promote a model, LoRA, workflow, node, GPU, dimension preset, or source
  policy claim to stable without recorded runtime output metadata.

## Status Handling

- Status docs record commands, dates, outputs, provider access failures,
  sidecars, and safety checks when they matter.
- Status docs are not the primary operating guide. If a status record creates a
  lasting rule, promote the rule into a system or operations doc.
- Never write tokens, signed URLs, private source URLs, or credentials into
  docs, fixtures, registry entries, workflow mappings, metadata, screenshots, or
  logs.

## Retirement

- Move completed or superseded plans to `docs/_legacy/roadmaps/`.
- Move obsolete research or task notes to `docs/_legacy/research/`.
- When retiring a doc, repair active links and keep only the stable rule in the
  durable doc that owns it.
- Do not leave hidden open decisions in prose. Put them in an active roadmap,
  report, status note, or decision document.
