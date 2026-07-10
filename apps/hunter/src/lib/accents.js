import { DEFAULT_ACCENTS, TOKEN_ORDER } from "../data/accentDefaults";

const LOCAL_KEY = "bh-accents-v1";

export function oklchString({ l, c, h }) {
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

// Theme is stored alongside the token map under the `_theme` key.
export const DEFAULT_THEME = "dark";

// Apply theme attribute + per-token CSS variable overrides to :root.
export function applyAccents(accents) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = accents?._theme || DEFAULT_THEME;
  for (const key of TOKEN_ORDER) {
    const val = accents?.[key];
    if (val) root.style.setProperty(`--${key}`, oklchString(val));
    else root.style.removeProperty(`--${key}`);
  }
}

// Merge stored accents over defaults so missing keys fall back cleanly.
export function mergeAccents(stored) {
  const out = { _theme: stored?._theme || DEFAULT_THEME };
  for (const key of TOKEN_ORDER) {
    out[key] = { ...DEFAULT_ACCENTS[key], ...(stored?.[key] || {}) };
  }
  return out;
}

export function loadLocalAccents() {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveLocalAccents(accents) {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(accents)); } catch {}
}

export function clearLocalAccents() {
  if (typeof localStorage === "undefined") return;
  try { localStorage.removeItem(LOCAL_KEY); } catch {}
}
