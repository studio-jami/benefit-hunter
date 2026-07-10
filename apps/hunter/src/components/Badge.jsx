import { toneStyle } from "../lib/tone";

export function Badge({ label, tone }) {
  const t = toneStyle(tone);
  return (
    <span
      style={{
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        background: t.bg,
        color: t.color,
        border: "1px solid " + t.border,
        padding: "2px 6px",
        borderRadius: 2,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}
