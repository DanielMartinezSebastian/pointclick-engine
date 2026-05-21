"use client";

export function DebugNumberInput({
  label,
  value,
  step = 0.1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label style={{ display: "grid", gap: "4px", fontSize: "11px", textTransform: "uppercase" }}>
      <span>{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          borderRadius: "2px",
          border: "2px solid #00ff41",
          background: "rgb(8 12 32 / 90%)",
          color: "#00ff41",
          padding: "0.5rem 0.6rem",
          fontSize: "12px",
          fontFamily: "var(--font-pixel), monospace",
          letterSpacing: "1px",
          outline: "none",
          cursor: "auto",
        }}
      />
    </label>
  );
}

export function DebugButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        borderRadius: "2px",
        border: "2px solid #00ff41",
        background: disabled ? "rgb(8 12 32 / 40%)" : "rgb(8 12 32 / 90%)",
        color: disabled ? "rgb(0 255 65 / 45%)" : "#00ff41",
        padding: "0.55rem 0.7rem",
        fontSize: "11px",
        fontFamily: "var(--font-pixel), monospace",
        letterSpacing: "1px",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {label}
    </button>
  );
}
