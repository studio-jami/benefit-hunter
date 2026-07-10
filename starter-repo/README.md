# Benefits Tracker — Starter Repo

A copy-paste template for tracking startup credits, free tiers, and partner
discounts for your own company. This is the same `programs/` tree Jami Studio
uses internally for Benefit Hunter. Every example in here is a real,
sanitized recreation of Jami Studio's own material (mostly ElevenLabs, plus
GitHub for the identity-map example) — personal info and redeemable codes
stripped, everything else intact — no invented placeholder companies.

## Use this as your own repo

1. Download this folder (zip, linked from the automation-kit page) or copy it directly.
2. Create a new **private** GitHub repo (it will hold real vendor correspondence and evidence).
3. Copy everything inside this `starter-repo/` folder into your new repo's root.
4. Delete the example files as you replace them with your own programs.

## Layout

```
programs/
  applications/                  submitted copy, follow-ups, reusable use-case text, pre-application evidence
  automation/                    OPTIONAL — Gmail-to-Sheet auto-sync, skip if you'd rather track by hand
  benefits/                      per-vendor registry, partner-tier map, access notes, acceptance verification
  tools/                         your own one-off scripts, none shipped (infra-specific)
```

`programs/` mirrors Jami Studio's actual internal tracker 1:1 — same folders,
same purpose, real content sanitized rather than invented.
