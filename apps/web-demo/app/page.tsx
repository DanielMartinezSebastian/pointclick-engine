"use client";

import { useEffect, useState } from "react";
import {
  createGameRuntime,
  type GameRuntime,
} from "./lib/engine/publicApi";
import { CRTEffectWrapper } from "./lib/components/CRTEffectWrapper";
import { DEMO_RUNTIME_CONFIG } from "./lib/engine/runtime/demoViewportOptions";
import GameTouchCanvas from "./components/GameTouchCanvas";
import { IntroScene } from "./components/intro/IntroScene";
import { useLocaleDetection } from "@pointclick-engine/engine-renderer-r3f";
import { createWebI18nAdapter } from "./lib/platform-web";
import { registerDemoDictionaries } from "../demo-content/dialogs";

// Register once at module load — synchronous, safe to run outside a component.
registerDemoDictionaries();

const DEMO_AVAILABLE_LOCALES = ["es", "en"];

// Shared adapter instance so both Home and Game use the same port.
const i18nPort = createWebI18nAdapter({ availableLocales: DEMO_AVAILABLE_LOCALES });

const I18N_CONFIG = {
  // English is the safe default: it's the lingua franca of the web.
  // The browser's navigator.language will upgrade it to "es" automatically
  // for Spanish-speaking users; localStorage persists the manual choice.
  defaultLocale: "en",
  fallbackLocale: "en",
  availableLocales: DEMO_AVAILABLE_LOCALES,
};

function Game() {
  // El runtime se crea en un efecto (con su dispose en el cleanup) y el canvas
  // solo se monta cuando ya existe: los efectos de los hijos corren antes que
  // los del padre, y useSceneRuntimeController fija la escena inicial en uno de
  // ellos. Montando el canvas despues, el `scene:changed` inicial llega al bus
  // (musica inicial) y no hace falta esperar al runtime con polling.
  // StrictMode (create -> dispose -> create) es seguro: cada ciclo del efecto
  // crea su propio runtime y el estado final apunta al ultimo, que sigue vivo.
  const [runtime, setRuntime] = useState<GameRuntime | null>(null);

  useEffect(() => {
    const created = createGameRuntime(DEMO_RUNTIME_CONFIG);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- publishes the external runtime handle so children mount only once it exists (children effects run before the parent's)
    setRuntime(created);

    return () => {
      created.dispose();
      setRuntime(null);
    };
  }, []);

  return runtime ? <GameTouchCanvas runtime={runtime} /> : null;
}

export default function Home() {
  const [introDone, setIntroDone] = useState(false);

  // Boot i18n at the Home level so both the intro and the game share the same
  // locale. Detection runs once on mount (bindPort → detectLocale), then
  // persists on every change.
  useLocaleDetection({ port: i18nPort, config: I18N_CONFIG });

  return (
    <CRTEffectWrapper
      preset="atari"
      scanlineOpacity={0.1}
    >
      {introDone ? <Game /> : <IntroScene onComplete={() => setIntroDone(true)} />}
    </CRTEffectWrapper>
  );
}
