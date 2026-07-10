// Access badges are neutral — text differentiates them. The colored chips
// added more noise than signal once we cleaned up the palette.

export const ACCESS_CONFIG = {
  anyone:      { label:"Anyone",     short:"ANY",   desc:"Open signup — no special status" },
  biz_email:   { label:"Biz Email",  short:"BIZ",   desc:"Business domain email or company identity required" },
  edu:         { label:".edu",       short:"EDU",   desc:"Educational institution verification required" },
  nonprofit:   { label:"Nonprofit",  short:"NP",    desc:"501(c)(3) or equivalent nonprofit status required" },
  oss:         { label:"OSS",        short:"OSS",   desc:"Active open-source project maintainer required" },
  accelerator: { label:"Accel / VC", short:"ACCEL", desc:"Accelerator, VC backing, or partner referral required" },
};

export const ACCESS_ORDER = ["anyone","biz_email","edu","nonprofit","oss","accelerator"];
