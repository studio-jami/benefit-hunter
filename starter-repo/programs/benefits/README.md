# Benefits

Canonical inventory for vendor programs, credits, and partner perks.

## How to use this

1. `vendors/` — one file per vendor: tier, status, value, and how it was won. Confirmed/active programs live at `vendors/` root; unconfirmed or in-process ones go in `vendors/_processing/` until they're activated. This is the per-program registry.
2. `partner-credit-map.md` — which responsibility lane each credit powers, referral hierarchy, and GTM/system strategy.
3. `access/` — account/org/identity placement notes (which login owns which benefit).
4. `evidence/` — proof a benefit was actually accepted/credited (verification, acceptance emails).

## Directory map

| Directory / file | Purpose |
| --- | --- |
| `vendors/` | One file per vendor: tier, status, value, redemption notes (confirmed at root, drafts in `_processing/`) |
| `partner-credit-map.md` | Lane/strategy map: which credit powers what, referral hierarchy |
| `access/` | Account, org, and identity placement notes |
| `evidence/` | Acceptance verification — proof a benefit was actually credited, not just applied for |
