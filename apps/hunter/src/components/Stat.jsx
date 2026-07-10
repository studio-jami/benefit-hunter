export function Stat({ label, value, tone }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: tone ? `var(--${tone})` : "var(--text)",
          fontFamily: "monospace",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 8, color: "var(--text-dim2)", textTransform: "uppercase", letterSpacing: "0.14em", whiteSpace: "nowrap" }}>
        {label}
      </div>
    </div>
  );
}
