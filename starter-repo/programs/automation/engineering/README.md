# Engineering (automation schema reference)

The contract `benefits-registry-sync/` (the Apps Script) actually implements.
Read this before changing `Code.gs`/`GeminiClient.gs`/`SheetManager.gs` — the
column shape, status colors, and structured-output format are load-bearing;
changing them without updating both sides breaks the sync silently.

`benefits-registry-schema.md` is the durable contract. There's no separate
validation script shipped here (the real ones are tied to Benefit Hunter's
own app data, not portable) — the Apps Script's own `testSyncNow` is your
validation loop against your own Sheet.
