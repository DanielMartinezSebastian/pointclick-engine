"use client";

import { useCallback, useEffect, useState } from "react";

import { LocaleSwitcher, useI18n, useLocaleDetection } from "@pointclick-engine/engine-renderer-r3f";

import { createWebI18nAdapter } from "../lib/platform-web-i18n";
import { AdventureCredits } from "./AdventureCredits";
import { AdventureGame } from "./AdventureGame";
import {
  ADVENTURE_LOCALE_KEY,
  ADVENTURE_LOCALES,
  clearAdventureProgress,
  hasAdventureSave,
  registerAdventureDictionaries,
} from "./adventureRuntime";

// Una sola vez al cargar el módulo: síncrono y seguro fuera de un componente.
registerAdventureDictionaries();

// Mismo mecanismo de idioma que `/` (detección + persistencia), pero con clave propia.
const i18nPort = createWebI18nAdapter({ availableLocales: ADVENTURE_LOCALES, storageKey: ADVENTURE_LOCALE_KEY });
const I18N_CONFIG = { defaultLocale: "en", fallbackLocale: "en", availableLocales: ADVENTURE_LOCALES };

const DEBUG_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true";

function Intro({ onStart }: { onStart: () => void }) {
  const { t } = useI18n();
  // `localStorage` solo existe en cliente: se lee tras montar para no desajustar la hidratación.
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura de localStorage tras montar
    setSaved(hasAdventureSave());
  }, []);

  return (
    <main
      aria-label={t("adv.intro.aria")}
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "radial-gradient(ellipse at 50% 35%, #12233a 0%, #070d1f 70%)",
        color: "#d9fbff",
        fontFamily: "var(--font-pixel), monospace",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "720px", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(34px, 6vw, 60px)", letterSpacing: "2px", margin: "0 0 24px", color: "#bff4ff" }}>
          {t("adv.title")}
        </h1>
        <p style={{ fontSize: "clamp(18px, 2.4vw, 24px)", lineHeight: 1.35, margin: "0 0 16px" }}>{t("adv.intro.1")}</p>
        <p style={{ fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.35, margin: "0 0 28px", opacity: 0.8 }}>
          {t("adv.intro.2")}
        </p>
        <button
          type="button"
          onClick={onStart}
          style={{
            fontFamily: "inherit",
            fontSize: "26px",
            letterSpacing: "2px",
            padding: "10px 28px",
            color: "#04121c",
            background: "#8ce3ff",
            border: "3px solid #1a5270",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {saved ? t("adv.intro.continue") : t("adv.intro.start")}
        </button>
        <div style={{ marginTop: "24px", display: "flex", justifyContent: "center" }}>
          <LocaleSwitcher
            ariaLabel={t("adv.language")}
            renderOption={({ locale, isActive, onClick }) => (
              <button
                key={locale}
                type="button"
                onClick={onClick}
                aria-current={isActive ? "true" : undefined}
                aria-label={locale === "es" ? "Español" : "English"}
                style={{
                  fontSize: "26px",
                  padding: "3px 6px",
                  border: "2px solid",
                  borderColor: isActive ? "#8ce3ff" : "transparent",
                  borderRadius: "4px",
                  background: "transparent",
                  cursor: "pointer",
                  opacity: isActive ? 1 : 0.45,
                }}
              >
                {locale === "es" ? "🇪🇸" : "🇬🇧"}
              </button>
            )}
          />
        </div>
      </div>
    </main>
  );
}

export default function AdventurePage() {
  useLocaleDetection({ port: i18nPort, config: I18N_CONFIG });

  const [started, setStarted] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  // `?debug` (solo con NEXT_PUBLIC_ENABLE_DEBUG=true) pinta los volúmenes de hotspots y NPCs.
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    if (!DEBUG_ENABLED) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lectura de la URL tras montar
    setDebug(new URLSearchParams(window.location.search).has("debug"));
  }, []);

  const handleCredits = useCallback(() => setShowCredits(true), []);
  const handleNewGame = useCallback(() => {
    clearAdventureProgress();
    window.location.reload();
  }, []);

  if (!started) return <Intro onStart={() => setStarted(true)} />;
  return (
    <>
      <AdventureGame debug={debug} onCredits={handleCredits} />
      {showCredits && <AdventureCredits onClose={() => setShowCredits(false)} onNewGame={handleNewGame} />}
    </>
  );
}
