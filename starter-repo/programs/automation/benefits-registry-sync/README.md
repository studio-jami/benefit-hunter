# Benefits Registry Auto-Updater — self-serve Apps Script kit

A small Google Apps Script that reads your own Gmail for startup benefit/credit
emails, extracts structured updates with Gemini (your own free API key), and
keeps a "Registry" tab in your own Google Sheet up to date automatically —
matched by program name, idempotent, with a full audit log.

**Runs entirely inside your Google account.** The only outbound call this
script makes is to Google's Gemini API, using an API key you generate and
control.

## Quick start

1. Create (or open) a Google Sheet. Add a tab named `Registry` (or change
   `CONFIG.REGISTRY_TAB` in `Code.gs` to match a tab you already have).
2. In the Sheet: **Extensions > Apps Script**. Delete the default code.
3. Create each file below and paste in the matching content from this folder:
   - `appsscript.json` (open via the gear icon > "Show manifest file")
   - `Code.gs`
   - `GeminiClient.gs`
   - `SheetManager.gs`
   - `GmailProcessor.gs`
   - `Logger.gs`
   - `DevTools.gs`
4. **Project Settings (gear) > Script Properties**: add `GEMINI_API_KEY` with
   a free key from https://aistudio.google.com/app/apikey.
5. In Gmail, create a label `benefit-programs` and apply it to relevant
   emails (or change `CONFIG.GMAIL_SEARCH_QUERY` in `Code.gs` to any search
   you prefer).
6. Back in the Apps Script editor, run `installTriggers` once. Authorize the
   requested Gmail + Sheets permissions when prompted (one-time).
7. Optional: import `registry.seed.example.csv` into your Registry tab to see
   the expected shape, then replace the example rows with your own programs.
8. Run `testSyncNow` (or use the new "Registry Sync" menu in the Sheet) to
   verify end to end. Check the Logs tab.

After that, it runs automatically on an hourly check (see `CONFIG.RUN_WINDOWS`
in `Code.gs` if you want to restrict it to specific hours/days).

## Files

| File | Responsibility |
| --- | --- |
| `Code.gs` | Configuration block, entrypoints, trigger installer, main sync loop, Sheet menu |
| `GeminiClient.gs` | Gemini API call + the extraction prompt (edit here to change the schema) |
| `SheetManager.gs` | All Sheet I/O: upsert by Program name, typed columns, canonical formatting |
| `GmailProcessor.gs` | Email → Gemini → apply loop |
| `Logger.gs` | Error logging helper |
| `DevTools.gs` | Manual debugging helpers (reprocess a message, show config, reset state) |
| `appsscript.json` | Manifest: time zone, OAuth scopes |
| `registry.seed.example.csv` | Structural example only — not real data |

## Privacy

- This script is bound to your own Sheet and runs under your own Google
  account's authorization. It reads Gmail (search + label) and writes to
  your Sheet only.
- Your Gemini API key lives only in Script Properties, never in the source.
- No data leaves Google's infrastructure except the Gemini API call, made
  with your key.

## Uninstall

1. Apps Script editor > Triggers (clock icon) > delete the `hourlyRegistryCheck` trigger.
2. Extensions > Apps Script > remove the project, or just delete the script files.
3. Optionally revoke access at https://myaccount.google.com/permissions.
