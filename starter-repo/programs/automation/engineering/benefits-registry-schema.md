# Benefits Registry Schema

Single durable contract for the live tabular registry (the Sheet
`benefits-registry-sync/` keeps in sync).

**Live Sheet:** `[your Google Sheet URL]`
**Main tab:** `Registry` (a native Google Sheets **Table**).

## Canonical Columns (Registry tab — 11 columns, exact order)

Keep it to these 11. Don't add or reintroduce others once you settle on a shape.

| # | Column | Type | Notes |
|---|--------|------|-------|
| A | Tier | **Dropdown** | T0 · T1 · T2 · T3 (T9 = parking/candidate lane) |
| B | Program | Text | Display name (e.g. "Retool for Startups") — also the match key |
| C | Status | **Dropdown** | drives the row color (see below) |
| D | Impact | Text | H · M · L |
| E | Value | **Number (USD)** | integer dollar value; blank when no official figure exists. No text/symbols. |
| F | Expiration | **Date** | single ISO date (expiry / redeem-by); blank when no concrete date |
| G | LastSourced | Text | `YYYY-MM-DD · <source>` (last signal date + sender/subject) |
| H | Referral | Text | codes + who (e.g. "Retool ref XXX-XXX-Retool") |
| I | Doc | Text | relative path to the rich program doc (e.g. `./vendors/retool-startups.md`) |
| J | EvidenceDriveLink | Text | Drive URL if an attachment was saved (usually blank) |
| K | Notes | Text | next actions, caveats, preserved value/window prose, confirmations |

## Canonical formatting

Owned by the native Table + `SheetManager.applyCanonicalFormat`, re-asserted on every write:

- Header bold, white text on a dark accent color; row 1 frozen.
- Table row banding; data vertically centered, single-line wrap.
- Tier and Status are **dropdown** columns.
- **Value** column number format `"$"#,##0`; **Expiration** column format `yyyy-mm-dd`.
- Status color rules (deduped on every write):
  - green: active, accepted, unlocked, credited, approved
  - yellow: applied, ready, in progress, target, candidate
  - red: denied

## Matching rule

Match incoming updates to existing rows by **Program name**, normalized:
lowercase, drop parentheticals and words like `for startups / startup /
scholarship / accelerator / grants / program`, hyphenate. Used only for
matching; never stored (`SheetManager.normalizeKey`).

## Status lifecycle

unlocked · accepted · approved · credited · active · applied · ready · in progress · target · candidate · denied · superseded.

## Gemini structured-output contract

Model returns ONLY a JSON array of operations:

```json
[
  {
    "program": "Retool for Startups",
    "action": "upsert",
    "fields": {
      "Status": "accepted",
      "Value": 60000,
      "Expiration": "2027-06-10",
      "Referral": "Retool ref XXX-XXX-Retool",
      "LastSourced": "2026-06-13 · startups@retool.com",
      "Notes": "..."
    },
    "confidence": 0.92,
    "rationale": "short explanation",
    "sourceMessageHint": "subject or from"
  }
]
```

Type rules the model MUST follow: `Value` is an integer USD (omit if no
figure — never invent), `Expiration` is a single ISO date (omit if none),
Status/Tier from their enums. Never emit removed columns.

## Data sourcing

Values are official-source verified (vendor startup pages). Where a vendor
has no public startup-credit program, leave Value blank and record the fact
rather than inventing a number.
