import { useMemo, useState } from "react";
import { hydrateExample } from "../data/examples";

// Shows a de-identified application archetype, optionally hydrated with the
// user's local profile document. Copy is manual — the tool never submits.
export function ExampleModal({ example, profileDoc, onClose }) {
  const [hydrated, setHydrated] = useState(true);
  const [copied, setCopied] = useState(false);

  const body = useMemo(
    () => (hydrated ? hydrateExample(example.body, profileDoc) : example.body),
    [example, profileDoc, hydrated]
  );

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(body);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(3px)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "40px 20px", overflowY: "auto",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: 6,
        width: "100%", maxWidth: 880, padding: "20px 22px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--line-soft)" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{example.title} — example</div>
            <div style={{ fontSize: 9, color: "var(--text-dim2)", marginTop: 2 }}>
              De-identified archetype from a real successful application. Hand it (or this file) to your agent to redraft — you review and submit.
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button onClick={() => setHydrated(h => !h)} style={{
              background: hydrated ? "color-mix(in oklch, var(--match) 14%, transparent)" : "transparent",
              border: "1px solid " + (hydrated ? "color-mix(in oklch, var(--match) 40%, transparent)" : "var(--line)"),
              color: hydrated ? "var(--match)" : "var(--text-dim)",
              borderRadius: 3, padding: "4px 10px", cursor: "pointer", fontSize: 9,
              fontFamily: "monospace", letterSpacing: "0.05em",
            }}>{hydrated ? "✓ my profile" : "raw template"}</button>
            <button onClick={copy} style={{
              background: "transparent", border: "1px solid var(--line)", color: "var(--text-dim)",
              borderRadius: 3, padding: "4px 10px", cursor: "pointer", fontSize: 9,
              fontFamily: "monospace", letterSpacing: "0.05em",
            }}>{copied ? "copied ✓" : "copy markdown"}</button>
            <button onClick={onClose} style={{
              background: "transparent", border: "1px solid var(--line)", color: "var(--text-dim)",
              borderRadius: 3, padding: "4px 10px", cursor: "pointer", fontSize: 10, fontFamily: "monospace",
            }}>×</button>
          </div>
        </div>
        <pre style={{
          whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0,
          fontSize: 11, lineHeight: 1.65, color: "var(--text-dim)", fontFamily: "monospace",
          maxHeight: "70vh", overflowY: "auto",
        }}>{body}</pre>
      </div>
    </div>
  );
}
