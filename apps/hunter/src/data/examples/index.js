// Agent-pointable application example library.
// Each entry is a de-identified archetype generated from real, successful
// Jami Studio applications (private sources in _ops/, never imported here).
// Placeholders ({{key}}) bind to profile document keys in src/data/profile.js
// so a filled profile (or an agent reading it) can hydrate the template.
//
// De-identification contract (docs/security/privacy-and-secrets.md):
// no names, emails, referral/coupon codes, invoice or account IDs, portal
// links, or company-identifying specifics.

import awsActivateFounders from "./aws-activate-founders.md?raw";
import anthropicStartups from "./anthropic-startups.md?raw";
import algoliaStartups from "./algolia-startups.md?raw";
import retoolStartups from "./retool-startups.md?raw";
import snowflakeAccelerator from "./snowflake-startup-accelerator.md?raw";
import vercelStartups from "./vercel-startups.md?raw";
import makeStartupProgram from "./make-startup-program.md?raw";
import elevenlabsStartupGrant from "./elevenlabs-startup-grant.md?raw";

export const EXAMPLES = [
  { id: "aws-activate-founders",         programId: "aws-founders",       vendor: "AWS",        title: "AWS Activate Founders",         body: awsActivateFounders },
  { id: "anthropic-startups",            programId: "anthropic-startups", vendor: "Anthropic",  title: "Claude for Startups",           body: anthropicStartups },
  { id: "algolia-startups",              programId: "algolia-startups",   vendor: "Algolia",    title: "Algolia Startup Program",       body: algoliaStartups },
  { id: "retool-startups",               programId: "retool-startups",   vendor: "Retool",     title: "Retool for Startups",           body: retoolStartups },
  { id: "snowflake-startup-accelerator", programId: null,                 vendor: "Snowflake",  title: "Snowflake Startup Accelerator", body: snowflakeAccelerator },
  { id: "vercel-startups",               programId: "vercel-startups",    vendor: "Vercel",     title: "Vercel for Startups",           body: vercelStartups },
  { id: "make-startup-program",          programId: "make-startup",      vendor: "Make",       title: "Make Startup Program",          body: makeStartupProgram },
  { id: "elevenlabs-startup-grant",      programId: "elevenlabs-startup", vendor: "ElevenLabs", title: "ElevenLabs Startup Grants",     body: elevenlabsStartupGrant },
];

export const EXAMPLES_BY_PROGRAM = Object.fromEntries(
  EXAMPLES.filter((e) => e.programId).map((e) => [e.programId, e])
);

// All {{placeholders}} used in an example body.
export function extractPlaceholders(body) {
  return [...new Set([...body.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))];
}

// Replace placeholders with filled profile values; leaves {{key}} visible
// when the profile has no value so the gap is obvious to the user/agent.
export function hydrateExample(body, profileDoc) {
  return body.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const v = profileDoc && profileDoc[key];
    return v && String(v).trim() ? String(v) : match;
  });
}
