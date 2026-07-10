// Each tag's tone is its semantic severity, used by the chip styler.
// ok < info < wait < stop. Neutral = descriptive only, no signal.

export const TAG_CONFIG = {
  easy_apply:                    { label:"Easy Apply",       tone:"ok",      desc:"Self-serve form — no partner, proposal, or manual gate" },
  partner_required:              { label:"Partner / Ref.",   tone:"wait",    desc:"Requires approved accelerator, VC referral, or partner" },
  proposal_required:             { label:"Proposal Req.",    tone:"wait",    desc:"Written research or business proposal required" },
  human_review:                  { label:"Manual Review",    tone:"wait",    desc:"Application reviewed by a human — approval not instant" },
  billing_risk:                  { label:"Billing Risk",     tone:"stop",    desc:"Credit card required; charges possible if limits exceeded" },
  requires_card:                 { label:"Card on File",     tone:"info",    desc:"Card required for verification or signup, but not billed automatically" },
  finance_kyc:                   { label:"Finance KYC",      tone:"wait",    desc:"Banking/KYC verification required — needs full business identity docs" },
  legal_entity_required:         { label:"Legal Entity",     tone:"wait",    desc:"Incorporated entity (LLC, Corp, etc.) with EIN required" },
  yc_only:                       { label:"YC Only",          tone:"wait",    desc:"Y Combinator current batch or alumni only" },
  expiry_short:                  { label:"<90d Expiry",      tone:"stop",    desc:"Credits or access expire in under 90 days — time-sensitive" },
  expiry_12mo:                   { label:"12mo Expiry",      tone:"info",    desc:"Credits or access expire within 12 months of activation" },
  stale:                         { label:"Verify First",     tone:"wait",    desc:"Plan details may have changed — confirm before applying" },
  requires_website:              { label:"Needs Website",    tone:"neutral", desc:"Requires a live public website matching the company" },
  requires_social:               { label:"Needs Social",     tone:"neutral", desc:"Requires public social/GitHub presence or LinkedIn" },
  requires_company_domain_email: { label:"Domain Email",     tone:"neutral", desc:"Email must use the company's domain (no Gmail/personal)" },
  no_application:                { label:"No Application",   tone:"neutral", desc:"No application required — just use, download, or call API" },
  manual_submit_only:            { label:"Manual Submit",    tone:"wait",    desc:"No public form — requires email outreach or intro" },
  usage_exclusions:              { label:"Excluded Services",tone:"info",    desc:"Credits don't cover certain services (e.g. GPU, AI) — read terms" },
  one_time_purchase:             { label:"One-Time Buy",     tone:"neutral", desc:"Perpetual license via one-time payment — no subscription" },
  renewal_required:              { label:"Annual Renewal",   tone:"info",    desc:"Free license must be renewed annually with proof of continued eligibility" },
};

export const TAG_ORDER = ["easy_apply","partner_required","manual_submit_only","proposal_required","human_review","no_application","billing_risk","usage_exclusions","requires_card","finance_kyc","legal_entity_required","requires_website","requires_social","requires_company_domain_email","yc_only","one_time_purchase","renewal_required","expiry_short","expiry_12mo","stale"];
