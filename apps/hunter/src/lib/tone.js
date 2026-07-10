// Resolve a semantic tone name (e.g., "ok", "wait", "accent", "cat-devops")
// to the CSS values for color / background / border. Components should call
// this instead of hard-coding hex values.

// Resolve a token name (accent / gold / match / ok / wait / stop / info /
// cat-devops / etc.) to chip-ready color / bg / border values, with bg + border
// derived from the token via color-mix.

export const NEUTRAL_STYLE = {
  color: "var(--text-dim)",
  bg: "color-mix(in oklch, var(--neutral) 14%, transparent)",
  border: "color-mix(in oklch, var(--neutral) 30%, transparent)",
};

export function toneStyle(tone) {
  if (!tone) return NEUTRAL_STYLE;
  const v = `var(--${tone})`;
  return {
    color: v,
    bg: `color-mix(in oklch, ${v} 14%, transparent)`,
    border: `color-mix(in oklch, ${v} 38%, transparent)`,
  };
}

// Soft highlight (hover/active) tied to a tone.
export function toneHighlight(tone, pct = 18) {
  if (!tone) return `color-mix(in oklch, var(--neutral) ${pct}%, transparent)`;
  return `color-mix(in oklch, var(--${tone}) ${pct}%, transparent)`;
}
