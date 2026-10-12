"use client";

import { useI18n } from "@pointclick-engine/engine-renderer-r3f";

const buttonStyle = {
  fontFamily: "inherit",
  fontSize: "22px",
  letterSpacing: "1px",
  padding: "8px 22px",
  borderRadius: "4px",
  cursor: "pointer",
} as const;

/** Pantalla final: créditos (con las atribuciones de `public/assets/LICENSES-art.md`) y nueva partida. */
export function AdventureCredits({ onClose, onNewGame }: { onClose: () => void; onNewGame: () => void }) {
  const { t } = useI18n();
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label={t("adv.credits.title")}
      data-testid="adventure-credits"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 600,
        display: "grid",
        placeItems: "center",
        overflowY: "auto",
        background: "rgb(7 13 31 / 94%)",
        color: "#d9fbff",
        fontFamily: "var(--font-pixel), monospace",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "760px", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(34px, 5vw, 52px)", margin: "0 0 8px", color: "#bff4ff" }}>
          {t("adv.credits.title")}
        </h2>
        <p style={{ fontSize: "24px", margin: "0 0 4px" }}>{t("adv.credits.subtitle")}</p>
        <p style={{ fontSize: "20px", margin: "0 0 22px", opacity: 0.8 }}>{t("adv.credits.made")}</p>
        <h3 style={{ fontSize: "24px", margin: "0 0 8px", color: "#8ce3ff" }}>{t("adv.credits.art")}</h3>
        <ul
          style={{
            listStyle: "none",
            margin: "0 0 24px",
            padding: 0,
            fontSize: "18px",
            lineHeight: 1.3,
            opacity: 0.9,
            display: "grid",
            gap: "8px",
          }}
        >
          <li>{t("adv.credits.art.lab")}</li>
          <li>{t("adv.credits.art.helix")}</li>
          <li>{t("adv.credits.art.icons")}</li>
          <li>{t("adv.credits.art.more")}</li>
        </ul>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onNewGame}
            style={{ ...buttonStyle, color: "#04121c", background: "#8ce3ff", border: "3px solid #1a5270" }}
          >
            {t("adv.newGame")}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{ ...buttonStyle, color: "#d9fbff", background: "transparent", border: "3px solid #3a7a9a" }}
          >
            {t("adv.credits.back")}
          </button>
        </div>
      </div>
    </section>
  );
}
