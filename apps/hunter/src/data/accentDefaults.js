// 14 user-editable color tokens. Values mirror tokens.css defaults so
// "Reset" returns to the same OKLCH the stylesheet declared.
//
// L is 0-1, C is 0-0.4, H is 0-360.

export const TOKEN_ORDER = [
  // Semantic
  "accent", "gold", "match", "ok", "wait", "stop", "info",
  // Category accents
  "cat-devops", "cat-multimedia", "cat-research", "cat-business", "cat-tech", "cat-science",
  // Neutral master (drives full grayscale)
  "neutral",
];

export const TOKEN_GROUPS = [
  { label: "Brand",        keys: ["accent", "gold", "match"] },
  { label: "Semantic",     keys: ["ok", "wait", "stop", "info"] },
  { label: "Categories",   keys: ["cat-devops", "cat-multimedia", "cat-research", "cat-business", "cat-tech", "cat-science"] },
  { label: "Surface",      keys: ["neutral"] },
];

export const TOKEN_LABELS = {
  "accent":          "Accent",
  "gold":            "Gold (money)",
  "match":           "Match (win)",
  "ok":              "OK (go)",
  "wait":            "Wait (caution)",
  "stop":            "Stop (risk)",
  "info":            "Info (in-flight)",
  "cat-devops":      "DevOps",
  "cat-multimedia":  "Multimedia",
  "cat-research":    "Research & Writing",
  "cat-business":    "Business",
  "cat-tech":        "Tech & AI",
  "cat-science":     "Science & Education",
  "neutral":         "Neutral (cascades grayscale)",
};

export const DEFAULT_ACCENTS = {
  "accent":         { l: 0.78, c: 0.16,  h: 75  },
  "gold":           { l: 0.83, c: 0.17,  h: 85  },
  "match":          { l: 0.78, c: 0.18,  h: 150 },
  "ok":             { l: 0.74, c: 0.16,  h: 148 },
  "wait":           { l: 0.84, c: 0.16,  h: 92  },
  "stop":           { l: 0.68, c: 0.19,  h: 25  },
  "info":           { l: 0.72, c: 0.13,  h: 250 },
  "cat-devops":     { l: 0.72, c: 0.13,  h: 250 },
  "cat-multimedia": { l: 0.70, c: 0.16,  h: 305 },
  "cat-research":   { l: 0.74, c: 0.16,  h: 148 },
  "cat-business":   { l: 0.85, c: 0.17,  h: 95  },
  "cat-tech":       { l: 0.70, c: 0.17,  h: 25  },
  "cat-science":    { l: 0.78, c: 0.12,  h: 195 },
  "neutral":        { l: 0.58, c: 0.005, h: 280 },
};
