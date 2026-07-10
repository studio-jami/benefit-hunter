export const DEFAULT_PROFILE = {
  hasBizEmail:           true,
  hasCompanyDomainEmail: false,
  hasIncorporatedEntity: false,
  hasEIN:                false,
  hasWebsite:            true,
  hasPublicSocial:       false,
  isStudent:             false,
  isEducator:            false,
  isNonprofit:           false,
  hasOSSProject:         false,
  hasAccelerator:        false,
  hasVC:                 false,
  isYC:                  false,
  willingToUseCard:      false,
};

export const PROFILE_FIELDS = [
  { key:"hasBizEmail",           label:"Business email"            },
  { key:"hasCompanyDomainEmail", label:"Company-domain email"      },
  { key:"hasIncorporatedEntity", label:"Incorporated entity"       },
  { key:"hasEIN",                label:"EIN / Tax ID"              },
  { key:"hasWebsite",            label:"Live public website"       },
  { key:"hasPublicSocial",       label:"Public social / GitHub"    },
  { key:"isStudent",             label:"Student (.edu)"            },
  { key:"isEducator",            label:"Educator at institution"   },
  { key:"isNonprofit",           label:"Registered nonprofit"      },
  { key:"hasOSSProject",         label:"Active OSS maintainer"     },
  { key:"hasAccelerator",        label:"In accelerator / incubator"},
  { key:"hasVC",                 label:"VC-backed"                 },
  { key:"isYC",                  label:"Y Combinator"              },
  { key:"willingToUseCard",      label:"Will provide card"         },
];

// ══════════════════════════════════════════════════════════════
// PROFILE DOCUMENT — the canonical answer set agents draw from
// when drafting applications. Each program's formConfig.fields
// references these keys.
// ══════════════════════════════════════════════════════════════
export const PROFILE_SCHEMA = {
  person: {
    title: "Personal",
    color: "#4FA3E8",
    fields: [
      { key:"first_name",    label:"First name",        type:"text" },
      { key:"last_name",     label:"Last name",         type:"text" },
      { key:"role_title",    label:"Role / title",      type:"text", placeholder:"Founder, CEO, CTO" },
      { key:"email",         label:"Primary email",     type:"email" },
      { key:"phone",         label:"Phone",             type:"tel" },
      { key:"country",       label:"Country",           type:"text" },
      { key:"linkedin_url",  label:"LinkedIn URL",      type:"url" },
      { key:"github_handle", label:"GitHub handle",     type:"text" },
    ],
  },
  company: {
    title: "Company",
    color: "#5DBF6B",
    fields: [
      { key:"company_name",    label:"Legal company name",            type:"text" },
      { key:"company_display", label:"Display name (if different)",   type:"text" },
      { key:"website",         label:"Website URL",                   type:"url" },
      { key:"domain",          label:"Company email domain",          type:"text", placeholder:"acme.com" },
      { key:"company_address", label:"Mailing address",               type:"textarea" },
      { key:"founded_date",    label:"Founded (YYYY-MM)",             type:"text", placeholder:"2024-03" },
      { key:"entity_type",     label:"Legal entity",                  type:"select", options:["","LLC","C-Corp","S-Corp","Sole Prop","Other"] },
      { key:"country_of_inc",  label:"Country of incorporation",      type:"text" },
      { key:"state_of_inc",    label:"State of incorporation",        type:"text" },
      { key:"ein",             label:"EIN / Tax ID",                  type:"text" },
      { key:"headcount",       label:"# employees",                   type:"number" },
      { key:"industry",        label:"Industry / sector",             type:"text" },
      { key:"one_liner",       label:"One-line description",          type:"text", placeholder:"≤140 chars" },
      { key:"description",     label:"Long description (2-4 sentences)", type:"textarea" },
      { key:"product_stage",   label:"Product stage",                 type:"select", options:["","Idea","Pre-launch","Private beta","Public beta","GA","Scaling"] },
    ],
  },
  funding: {
    title: "Funding & Stage",
    color: "#F5C542",
    fields: [
      { key:"stage",            label:"Stage",                          type:"select", options:["","Bootstrapped","Pre-seed","Seed","Series A","Series B+","Other"] },
      { key:"total_raised",     label:"Total raised (USD)",             type:"number" },
      { key:"last_round_date",  label:"Last round (YYYY-MM)",           type:"text", placeholder:"2025-09" },
      { key:"lead_investor",    label:"Lead investor",                  type:"text" },
      { key:"investors",        label:"Other investors (comma-sep)",    type:"text" },
      { key:"accelerator",      label:"Accelerator / incubator",        type:"text", placeholder:"YC W26, Techstars, etc." },
      { key:"yc_batch",         label:"YC batch (if applicable)",       type:"text", placeholder:"W26" },
    ],
  },
  presence: {
    title: "Online Presence",
    color: "#B57BEA",
    fields: [
      { key:"github_org",        label:"Company GitHub org URL",     type:"url" },
      { key:"twitter_url",       label:"Company Twitter / X URL",    type:"url" },
      { key:"linkedin_company",  label:"Company LinkedIn URL",       type:"url" },
      { key:"demo_url",          label:"Product demo / video URL",   type:"url" },
      { key:"press_url",         label:"Notable press link",         type:"url" },
    ],
  },
  use_cases: {
    title: "Use Case Templates",
    color: "#F07060",
    fields: [
      { key:"use_case_general",  label:"General product use case (2-4 sentences)", type:"textarea" },
      { key:"use_case_ai",       label:"AI / LLM use case",                  type:"textarea" },
      { key:"use_case_cloud",    label:"Cloud infrastructure use case",      type:"textarea" },
      { key:"use_case_data",     label:"Database / vector / data use case",  type:"textarea" },
    ],
  },
  proofs: {
    title: "Verification Documents",
    color: "#D4A05A",
    fields: [
      { key:"incorp_doc_url",   label:"Incorporation doc URL (Drive link)",      type:"url" },
      { key:"ein_doc_url",      label:"EIN confirmation letter URL",             type:"url" },
      { key:"edu_email",        label:".edu email (if student/faculty)",         type:"email" },
      { key:"school_name",      label:"School / institution name",               type:"text" },
      { key:"nonprofit_id",     label:"Nonprofit 501(c)(3) EIN",                 type:"text" },
      { key:"oss_project_url",  label:"Primary OSS project URL",                 type:"url" },
    ],
  },
};

export const PROFILE_DOC_KEYS = Object.values(PROFILE_SCHEMA).flatMap(s => s.fields.map(f => f.key));
export const DEFAULT_PROFILE_DOC = Object.fromEntries(PROFILE_DOC_KEYS.map(k => [k, ""]));

export function getFieldMeta(key) {
  for (const section of Object.values(PROFILE_SCHEMA)) {
    const f = section.fields.find(f => f.key === key);
    if (f) return f;
  }
  return { key, label: key, type: "text" };
}

export function getApplicationReadiness(program, profileDoc) {
  const needed = (program.formConfig && program.formConfig.fields) || [];
  if (needed.length === 0) return { needed:0, filled:0, missing:[], filledKeys:[], status:"none" };
  const filled = [];
  const missing = [];
  for (const k of needed) {
    const v = profileDoc[k];
    if (v && String(v).trim()) filled.push(k);
    else missing.push(k);
  }
  return {
    needed: needed.length,
    filled: filled.length,
    missing,
    filledKeys: filled,
    status: missing.length === 0 ? "ready" : filled.length === 0 ? "empty" : "partial",
  };
}

export function profileMatches(p, profile) {
  // Build the user's available access types
  const userAccess = new Set(["anyone"]);
  if (profile.hasBizEmail)                            userAccess.add("biz_email");
  if (profile.isStudent || profile.isEducator)        userAccess.add("edu");
  if (profile.isNonprofit)                            userAccess.add("nonprofit");
  if (profile.hasOSSProject)                          userAccess.add("oss");
  if (profile.hasAccelerator || profile.hasVC || profile.isYC) userAccess.add("accelerator");

  // Need at least one matching access path
  const hasAccessPath = p.access.some(a => userAccess.has(a));
  if (!hasAccessPath) return false;

  // Hard blocks based on tags
  if (p.tags.includes("legal_entity_required") && !profile.hasIncorporatedEntity) return false;
  if (p.tags.includes("finance_kyc") && (!profile.hasIncorporatedEntity || !profile.hasEIN)) return false;
  if (p.tags.includes("yc_only") && !profile.isYC) return false;
  if ((p.tags.includes("requires_card") || p.tags.includes("billing_risk")) && !profile.willingToUseCard) return false;
  if (p.tags.includes("requires_website") && !profile.hasWebsite) return false;
  if (p.tags.includes("requires_social") && !profile.hasPublicSocial) return false;
  if (p.tags.includes("requires_company_domain_email") && !profile.hasCompanyDomainEmail) return false;

  return true;
}
