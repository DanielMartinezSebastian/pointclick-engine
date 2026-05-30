"use client";

type Props = {
  icon: string;
  label: string;
  pressed: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function MuteToggle({
  icon,
  label,
  pressed,
  disabled,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "8px 12px",
        fontSize: "12px",
        fontWeight: "bold",
        color: pressed ? "#a8c8d8" : "#bff4ff",
        backgroundColor: pressed ? "rgb(40 60 80 / 100%)" : "rgb(26 82 112 / 100%)",
        border: "2px solid rgb(132 230 255 / 78%)",
        borderRadius: "4px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        textShadow: "0 2px 0 rgb(0 0 0 / 35%)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "inset 0 0 0 2px rgb(255 255 255 / 8%)",
      }}
    >
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
