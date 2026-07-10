import { ACCESS_CONFIG } from "../data/access";

// Access badges are neutral — text-only differentiation.
export function AccessBadge({ accessKey }) {
  const access = ACCESS_CONFIG[accessKey];
  if (!access) return null;

  return (
    <span
      title={access.desc}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 7px",
        background: "color-mix(in oklch, var(--neutral) 10%, transparent)",
        border: "1px solid color-mix(in oklch, var(--neutral) 28%, transparent)",
        borderRadius: 3,
        flexShrink: 0,
        fontSize: 9,
        fontWeight: 700,
        color: "var(--text-dim)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {access.short}
    </span>
  );
}
