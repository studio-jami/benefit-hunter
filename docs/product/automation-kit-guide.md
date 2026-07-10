# Automation Kit — Self-Serve Setup Guide

Status: durable product doc
Owner: Jami Studio

The Automation Kit is an optional, self-serve add-on to Benefit Hunter: a small
Google Apps Script that keeps a benefits tracking Sheet in your own Google account
up to date automatically, by reading your Gmail for benefit/credit emails and
extracting structured updates with Gemini.

**It is not required to use Benefit Hunter.** The finder, guided flow, and example
library all work without it. This kit is for founders who want to go a step further
and stop manually re-typing "I got accepted into X" into a spreadsheet.

Kit source: [`apps/hunter/public/automation-kit/`](../../apps/hunter/public/automation-kit/)
(also downloadable directly from the live site at `benefits.jami.studio/automation-kit/`).

## What it does

1. On a schedule you control (hourly check, optionally restricted to specific
   hours/days), it searches your Gmail for emails matching a query you choose
   (a label like `benefit-programs` by default).
2. Each candidate email is sent to the Gemini API — using a free API key **you**
   create and control — for structured extraction (program name, status, value,
   expiration, referral codes, etc.).
3. Results are upserted into a `Registry` tab in **your own** Google Sheet,
   matched by program name so re-processing never creates duplicates.
4. Every run appends an audit row (before/after, confidence, rationale) to a
   `Logs` tab, and updates a `Dashboard` tab with last-sync stats.
5. The canonical formatting (column widths, Status color-coding, typed Value/
   Expiration columns) is re-applied after every write.

## Privacy — read this first

- The script is a **container-bound Apps Script**: you create it inside your own
  Google Sheet, and it runs under your own Google account's authorization.
- It requests Gmail (search + label) and Sheets scopes. It does **not** request
  Gmail send or delete permissions.
- Your Gemini API key is stored only in that script's **Script Properties**
  (`Project Settings > Script Properties`), never in the source file, and never
  transmitted anywhere except directly to Google's Gemini API as part of your
  own request.
- **Jami Studio receives nothing.** There is no server component, no callback,
  no telemetry. The only network call the script makes is to Google's Gemini
  API endpoint, authenticated with your key.
- You can revoke everything at any time — see Uninstall at the end of this guide.

## Prerequisites

- A Google account with Gmail and Google Sheets.
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
  (no billing required for the free tier; check current Gemini API quotas/pricing
  if you plan on heavy use).

## Step-by-step setup

### 1. Create your Sheet

Create a new Google Sheet (or use an existing one). You don't need to pre-create
any tabs — the script creates `Registry`, `Logs`, `Applications`, and `Dashboard`
automatically on first run if they don't exist. Tab names are configurable in
`Code.gs`'s `CONFIG` block if you'd rather reuse existing tabs.

### 2. Add the script files

In your Sheet: **Extensions > Apps Script**. Delete any default `Code.gs`
content, then create each of these files and paste in the matching content
from [`apps/hunter/public/automation-kit/`](../../apps/hunter/public/automation-kit/):

- `appsscript.json` — open via the gear icon (Project Settings) > check
  "Show `appsscript.json` manifest file in editor", then paste over its content.
- `Code.gs`
- `GeminiClient.gs`
- `SheetManager.gs`
- `GmailProcessor.gs`
- `Logger.gs`
- `DevTools.gs`

Save all files (Ctrl+S / Cmd+S).

### 3. Add your Gemini API key

**Project Settings (gear icon) > Script Properties > Add script property.**
Key: `GEMINI_API_KEY`. Value: your key from
https://aistudio.google.com/app/apikey. This is the only secret the kit needs,
and it never leaves Script Properties.

### 4. Tag the emails you want tracked

By default the script searches Gmail for `label:benefit-programs`. In Gmail,
create a label named `benefit-programs` and apply it (manually, or via a Gmail
filter) to acceptance emails, credit grants, application receipts, and denials
you want tracked. Alternatively, edit `CONFIG.GMAIL_SEARCH_QUERY` in `Code.gs`
to any Gmail search you prefer (e.g. `newer_than:14d (credits OR "startup program")`).

### 5. Authorize and install the trigger

Back in the Apps Script editor, select `installTriggers` from the function
dropdown and click **Run**. Google will prompt you to authorize the script's
requested permissions (Gmail modify — used only to search and label threads
as processed — and Sheets) — this is a one-time consent screen for your own
script acting on your own account.

### 6. (Optional) Seed the shape

Import `registry.seed.example.csv` into your `Registry` tab to see the expected
11-column shape, then delete the two example rows and start adding your own
tracked programs (or just let the automation create rows as real emails arrive).

### 7. Test

Run `testSyncNow` from the editor (or use the **Registry Sync** menu that now
appears in your Sheet: "Run sync now (force)"). Check the `Logs` tab for new
rows, and the `Registry` tab for updates. Use `dryRunSync` / "Dry run (no
writes)" first if you want to see what would happen without writing anything.

## Schedule and idempotency

- `installTriggers()` sets up a single hourly trigger. By default (empty
  `CONFIG.RUN_WINDOWS`), every hourly tick does real work.
- To restrict to specific hours/days (e.g. business hours only), set
  `CONFIG.RUN_WINDOWS` in `Code.gs` — see the inline example in that file.
- Idempotency comes from two places: Gmail messages already logged in the
  `Logs` tab are skipped on future runs (unless you force a re-run), and
  Sheet rows are matched and updated by normalized Program name rather than
  duplicated.
- Re-run `installTriggers()` any time to clean up and reinstall the trigger
  (useful after editing the schedule).

## Re-applying canonical formatting

If the Sheet's look drifts (column widths, Status colors, number formats),
use the **Registry Sync > Re-apply canonical format** menu item, or run
`reapplyCanonicalFormat()` from the editor. This is safe to run any time and
never deletes columns or data.

## Editing the schema

The default 11-column shape (`Tier, Program, Status, Impact, Value, Expiration,
LastSourced, Referral, Doc, EvidenceDriveLink, Notes`) is a **recommended
default**, not a requirement. To change it:

1. Edit `REGISTRY_HEADERS` in `SheetManager.gs`.
2. Update the matching column-type rules and the JSON example in
   `GeminiClient.gs`'s prompt so Gemini's output still matches your schema.
3. Update `registry.seed.example.csv`'s header row to match.

If you track multi-vendor referral bundles (e.g. an accelerator perk pack),
just add them as ordinary rows — the schema has no special-cased vendor or
partner name baked in.

## Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| `Missing GEMINI_API_KEY` error | Add the `GEMINI_API_KEY` script property (step 3). |
| Gemini API returns a non-200 status | Check your key is valid and the model name in `CONFIG.GEMINI_MODEL` is available to your key — see https://ai.google.dev/gemini-api/docs/models for current names. |
| No threads found | Check your Gmail label/search actually matches emails, and that `CONFIG.GMAIL_SEARCH_QUERY` is correct. |
| Rows not updating / duplicating | Confirm `Program` names in emails and in the Sheet are close enough for `SheetManager.normalizeKey` to match; check the `Logs` tab's `Before`/`After` columns. |
| Trigger doesn't fire | Re-run `installTriggers()`; check Apps Script editor > Triggers (clock icon) that `hourlyRegistryCheck` exists. |
| Labeling fails silently | Requires the `gmail.modify` scope in `appsscript.json` (already included) — re-authorize if you changed scopes after installing. |

## Uninstall

1. Apps Script editor > Triggers (clock icon) > delete the `hourlyRegistryCheck` trigger.
2. Extensions > Apps Script > delete the script project (or just the files).
3. Optionally revoke the app's access at https://myaccount.google.com/permissions.

Your Sheet, its data, and your Gmail are untouched by uninstalling — only the
automation stops.
