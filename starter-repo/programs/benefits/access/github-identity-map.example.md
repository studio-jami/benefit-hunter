# GitHub Identity Map — Example

How GitHub accounts, orgs, and enterprises map to your own lanes. Verified
periodically via the GitHub API or by hand.

## Principles

1. **OSS product repos live under one org** (e.g. your company's GitHub org) — public open-core.
2. **A separate commercial org** (if you have a second commercial entity) stays fully separate — different billing, different enterprise posture.
3. **Your personal account** — founder identity, day-to-day CLI/keyring, npm owner if relevant.
4. **A service/automation account** — holds admin PATs for CI secrets, bot commits; not a human's daily-driver account.

## Account inventory

| Identity | Type | Plan / role | Purpose |
| --- | --- | --- | --- |
| `[your-personal-username]` | User | Personal | Primary human developer; npm owner; CLI default |
| `[your-org-service-account]` | User | Service/automation | Admin PAT for CI secrets seeding |
| `[your-company-org]` | Organization | Enterprise | Product lane — all foundation + hub repos |

## Enterprise placement

Confirm which org's billing account actually received the startup credit —
GitHub for Startups credits attach to **one** enterprise account and are not
transferable. Check the onboarding/welcome email for which org it landed on.

## Collaborator vs org member

| Need | Use |
| --- | --- |
| Long-term OSS contributor | Org member (role: member) |
| Short-term contractor on one repo | Outside collaborator on that repo only |
| Agent/automation | Machine user + fine-scoped PAT or GitHub App |
| Personal experiments | Personal account repos — do not commingle secrets with the org |

## PAT & secrets flow

- Keep the admin PAT out of source control — Script Properties, a secrets
  manager, or CI secrets only, never committed.
- Scope PATs to the minimum needed (repo-level fine-grained tokens over
  classic org-wide ones where the provider supports it).
