export function agentCanResearch(p) {
  return !p.tags.includes("stale");
}

export function agentCanDraft(p) {
  return p.tags.includes("easy_apply") &&
         !p.tags.includes("billing_risk") &&
         !p.tags.includes("stale");
}

export function agentCanSubmit(p) {
  return agentCanDraft(p) &&
         !p.tags.includes("human_review") &&
         !p.tags.includes("proposal_required") &&
         !p.tags.includes("partner_required") &&
         !p.tags.includes("manual_submit_only") &&
         !p.tags.includes("no_application") &&
         !p.tags.includes("finance_kyc") &&
         !p.tags.includes("legal_entity_required") &&
         !p.tags.includes("requires_card");
}

export function agentState(p) {
  if (agentCanSubmit(p))   return { key:"submit",   label:"Quick Apply",   tone:"ok"      };
  if (agentCanDraft(p))    return { key:"draft",    label:"Quick Draft",   tone:"wait"    };
  if (agentCanResearch(p)) return { key:"research", label:"Research Only", tone:"info"    };
  return { key:"stale", label:"Verify First", tone:"wait" };
}

// Derive the kind of work the agent (or human) needs to do.
export const DOWNLOAD_IDS = new Set([
  "blender","gimp","inkscape","audacity","obs-studio","davinci-resolve",
  "hemingway-web","rstudio-free","activepieces","n8n-selfhosted","arxiv",
  "open-gov-data","aws-open-data","obsidian-free",
]);
export const CATALOG_IDS = new Set([
  "coursera-audit","edx-audit","techsoup",
]);

export function getAgentTask(p) {
  if (p.tags.includes("stale"))                                    return { key:"research", label:"Verify Terms" };
  if (p.tags.includes("proposal_required"))                        return { key:"proposal", label:"Write Proposal" };
  if (p.tags.includes("manual_submit_only"))                       return { key:"manual",   label:"Outreach" };
  if (p.tags.includes("partner_required"))                         return { key:"manual",   label:"Find Partner" };
  if (p.tags.includes("finance_kyc"))                              return { key:"manual",   label:"KYC Filing" };
  if (p.tags.includes("no_application"))                           return { key:"none",     label:"Use Direct" };
  if (DOWNLOAD_IDS.has(p.id))                                      return { key:"download", label:"Just Download" };
  if (CATALOG_IDS.has(p.id))                                       return { key:"browse",   label:"Browse Catalog" };
  if (p.type === "API")                                            return { key:"signup",   label:"API Key Signup" };
  if (["Credits","License","Program","Discount","Bundle"].includes(p.type)) return { key:"apply", label:"Fill Application" };
  return { key:"signup", label:"Create Account" };
}

// Agent task is descriptive (shown in cfg panel only). All neutral — the
// label carries the meaning, no semantic alarm needed.
export const AGENT_TASK_TONES = {
  apply:    "neutral",
  signup:   "neutral",
  download: "neutral",
  browse:   "neutral",
  proposal: "neutral",
  manual:   "neutral",
  research: "neutral",
  none:     "neutral",
};
