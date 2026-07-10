# Automation (optional)

Not required. Skip this whole folder if you'd rather update `benefits/vendors/` by hand.

`benefits-registry-sync/` is a small Google Apps Script that reads your own
Gmail for benefit/credit emails, extracts structured updates with Gemini
(your own free API key), and keeps a Sheet in sync automatically — matched by
program name, idempotent, with an audit log. Runs entirely in your own
Google account; see `benefits-registry-sync/README.md` for setup.

`engineering/` is the schema this automation implements — the exact Sheet
column contract and Gemini structured-output format. Read it before changing
the column shape on either side (Sheet or `.gs` code); the two have to stay
in sync.
