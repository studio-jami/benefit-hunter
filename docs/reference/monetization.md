# Monetization and the Funnel

## The signup trigger is your most important UX decision

Don't gate too early. The ideal moment is _after_ the profile matching runs and you can show them a personalized number — "You qualify for $847,000 in free credits." That specificity is the hook. Gate on saving _that result_, not on entering the tool. The emotional peak is maximum right before the CTA.

## The profile is your moat, not the catalog

Once someone fills in 38 fields, switching cost is real. The catalog can be scraped — the filled profile can't. Invest heavily in making that fill process painless. LinkedIn OAuth import that pre-populates first name, last name, role, company name, website, and LinkedIn URL in one click would cut fill time by 60% and dramatically improve top-of-funnel conversion.

## There's a data layer here that nobody else will have

As you accumulate signups, you'll start seeing approval and rejection patterns by company profile. That's genuinely novel intelligence. "AWS Activate Founders has a 71% approval rate for pre-seed SaaS companies with a live product." Anonymized, aggregated — but powerful. Could become its own report product or a premium filter. No one else has this because nobody else is tracking applications at scale.

## White-labeling for accelerators is a high-margin B2B wedge

Accelerators obsess over perks for their portfolio companies. "We'll get all your portfolio companies applied for $800k in benefits as part of Demo Day" is an easy sell to a Y Combinator, Techstars, or any of the 300 smaller programs. They could either pay per cohort or co-brand the tool. That channel also drives perfect-fit signups — early-stage founders exactly when they need credits.

## The agent's natural evolution is a browser extension

The profile doc you have now is the data layer. The next physical form of the agent isn't a dashboard feature — it's a Chrome extension that detects a startup application form on any website and autofills from the profile. That's the distribution wedge. It also makes the agent feel ambient rather than a separate product you have to go back to.

## Be deliberate about where the auto-submit line is

You already built the right taxonomy — Submit Ready vs Draft Ready vs Research Only. The Submit Ready category will handle low-risk signups fine. But some programs explicitly prohibit automated submissions in their ToS. The safe and defensible model for anything above a basic signup is: agent drafts the packet, human clicks submit. That's actually a better sales pitch anyway — "we do 90% of the work, you spend 30 seconds reviewing."

## The weekly digest email is a retention engine

Most founders sign up, get excited, and forget. A Tuesday email — "Your queue: 4 Submit-Ready applications you haven't filed. Two programs expire this month." — brings them back with urgency and specificity. That's not a newsletter, it's a to-do list delivered to their inbox. High open rate, direct path to conversion.

The core insight you landed on is right: the value isn't the list, it's removing the activation energy. You built the list. The profile doc is the activation energy removal. The agent is the completion. That's a clean three-act product arc with natural monetization at each transition. Really well-structured.

---

The extension is the cleaner product in almost every way. Let me break it down properly.

## Why it beats Playwright fundamentally

Playwright is a server-side headless browser pretending to be a human. The problems stack up fast — Cloudflare blocks it, CAPTCHAs stop it, application forms with email verification loops break it, and every program's ToS has language about automated submissions. You're also running infrastructure, paying for compute, debugging flaky selectors at 2am when AWS redesigns their form.

The extension _is_ the user's browser. Their session, their cookies, their IP address, their mouse cursor doing the clicking. Legally and technically it's indistinguishable from the user applying themselves — because they are. You're just removing the copy-paste.

## The architecture in plain terms

Three pieces:

_Content script_ — lives on the page, reads the DOM, finds form inputs, fills them in when told to. It's a few hundred lines of JavaScript that runs inside the tab.

_Service worker_ — the background brain. Stores the profile, does the field-matching logic, talks to hunter.yrka.io to sync state.

_Popup_ — the small UI that appears when you click the extension icon. Shows program recognition, readiness, and the one button.

## The user flow

Founder navigates to `aws.amazon.com/startups/credits`. Extension detects the URL pattern, matches it to "AWS Activate Founders" from your catalog. The extension icon gets a badge — green `$1.35k`. They click it. Popup shows:

AWS Activate Founders
$1,350 · Submit Ready · ✓ Data: 3/3 ready
───────────────────────────────
✓ Company name → Acme Inc
✓ Website → acme.com
✓ Description → We build AI...

[ Fill Form ] [ Skip ]

They hit Fill Form. The content script fires, finds the three inputs, fills them. Founder reviews, tweaks one sentence, clicks Submit themselves. Extension popup shows a "Mark Applied" button. They tap it. Status syncs back to hunter.yrka.io. Done in 90 seconds.

## The field matching

Your `formConfig.fields` array is already the mapping — `["company_name", "website", "description"]`. The content script needs to map those canonical keys to actual DOM inputs. You do it in layers:

1. Label text## — scan `<label>` elements for "Company Name", "Website", "Describe your product"

2. Input attributes## — `name`, `id`, `placeholder` often contain the field purpose

3. Type hints## — `type="email"` → email field, `type="url"` → website

4. Known overrides## — per program, hardcode the selectors for the 20 biggest programs (AWS, GCP, GitHub, Notion, etc.) where you know the exact DOM

This is the part you build once and refine over time as forms change. The catalog gives you 172 starting URLs. The `formConfig` you already built is literally the spec.

## The React/Vue gotcha

One real technical nuance — most modern forms use React-controlled inputs. Setting `input.value = "Acme Inc"` does nothing because React doesn't see the DOM event. You have to dispatch a native input event after setting the value:

```js
const nativeInputSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype,
  "value",
).set;
nativeInputSetter.call(input, "Acme Inc");
input.dispatchEvent(new Event("input", { bubbles: true }));
```

That's the unlock for every React/Vue form. Without it the autofill silently fails.

## The monetization hook

Extension installs free from the Chrome Web Store. Program detection is free — shows the badge, shows the match, shows the value. That's the hook that makes people keep it installed.

But autofill requires a profile. Profile sync requires a hunter.yrka.io account. Account creation is the lead. Full profile doc (38 fields) is the activation. Agent-tier subscription is the upsell.

The extension is actually a better top-of-funnel than SEO for a specific cohort — founders who are _already in the act of applying_. That's the highest intent moment in the entire funnel. They're on the AWS form. They don't need to be convinced the program exists. You just appear and say "want help with that?"

## The moat

The catalog is your IP. The URL-to-program mapping, the field configs, the value estimates, the tag taxonomy — 18 months from now that's 400 programs with verified field layouts and approval rate data behind each one. Competitors have to rebuild that from scratch. Users who have filled their profile aren't switching. That's a real moat that compounds.

## What to build first

Ruthlessly minimal MVP:

1. Manifest V3 extension with a content script that watches URL changes
2. Pattern match against your 172 program URLs
3. Pull profile from `hunter.yrka.io/api/profile` via stored auth token
4. Fill the 5 most common fields: `company_name`, `website`, `email`, `first_name`, `last_name`
5. Popup shows program name, value, a Fill button, a Mark Applied button
6. Applied status POSTs back to your API

That's maybe a week of focused engineering. Everything else — per-program selector overrides, multi-page forms, Gmail confirmation detection, team sharing — is iteration. Ship the thing that fills five fields on AWS Activate and makes a founder go "oh that's magical." That's all you need to validate.

The Playwright version needs a server, a queue, a headless browser pool, anti-detection middleware, and still breaks on CAPTCHAs. The extension needs a content script and a profile API. Ship the extension.
