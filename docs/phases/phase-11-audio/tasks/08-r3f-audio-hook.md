# Task 11.8 — R3F: useAudioSystem hook + integración runtime

**Effort**: 1h | **Blocks**: [11.9, 11.10] | **Blocked by**: [11.5, 11.7]

---

## 🎯 Objetivo

Crear `useAudioSystem` en `packages/engine-renderer-r3f/src/hooks/`. Se suscribe a los eventos del runtime (`scene:changed`, `item:pickedUp`, etc.), llama a `resolveAudioEvents` para derivar eventos de audio y los manda al `AudioPort`. También sincroniza el store de settings con el adapter en cada cambio.

---

## ✅ Success Criteria

- [ ] `packages/engine-renderer-r3f/src/hooks/useAudioSystem.ts` creado.
- [ ] Recibe `{ runtime, port, defaults, scenes, items, transitions, settingsStore }`.
- [ ] Se suscribe a los eventos relevantes del runtime al montar; cleanup al desmontar.
- [ ] Cada vez que el runtime emite un evento del juego, llama `resolveAudioEvents` → si devuelve `audio:sfxRequested` → `port.playSound(...)`; si `audio:musicRequested` → `port.playMusic(...)`; si `audio:musicStopped` → `port.stopMusic(...)`.
- [ ] Maneja `audio:settingsChanged` para sincronizar el adapter (`port.setMuted` / `port.setVolume` por categoría).
- [ ] Mantiene un ref de la música actual (`previousMusic`) para que el rules processor pueda decidir si parar al cambiar de escena.
- [ ] Re-exportado desde `packages/engine-renderer-r3f/src/index.ts`.
- [ ] Tests: ≥6 tests con `HeadlessAudioAdapter` verificando que las llamadas correctas se hagan.

---

## 📝 Instructions

### Step 1 — Crear el hook

`packages/engine-renderer-r3f/src/hooks/useAudioSystem.ts`:

```typescript
import { useEffect, useRef } from "react";
import {
  resolveAudioEvents,
  type AudioDefaultsConfig,
  type AudioRulesContext,
  type AudioPort,
  type AudioSettingsStore,
  type GameEvent,
  type GameScene,
  type ItemDefinition,
  type GameSceneTransition,
  type SceneMusicConfig,
} from "@pointclick-engine/engine-core";

interface MinimalRuntime {
  on(type: GameEvent["type"], handler: (e: GameEvent) => void): () => void;
}

interface UseAudioSystemOpts {
  runtime: MinimalRuntime;
  port: AudioPort;
  defaults: AudioDefaultsConfig;
  scenes: Record<string, GameScene>;
  items: Record<string, ItemDefinition>;
  transitions: Record<string, GameSceneTransition>;
  settingsStore: AudioSettingsStore;
}

export function useAudioSystem(opts: UseAudioSystemOpts): void {
  const previousMusicRef = useRef<SceneMusicConfig | undefined>(undefined);

  useEffect(() => {
    const { runtime, port, defaults, scenes, items, transitions, settingsStore } = opts;

    const ctxFor = (): AudioRulesContext => ({
      defaults,
      currentScene: undefined,
      previousMusic: previousMusicRef.current,
      items,
      transitions,
    });

    const dispatchAudio = (events: GameEvent[]) => {
      for (const e of events) {
        if (e.type === "audio:sfxRequested") {
          port.playSound(
            { id: e.soundUrl, url: e.soundUrl, category: e.category, volume: e.volume },
          );
        } else if (e.type === "audio:musicRequested") {
          port.playMusic(
            { id: e.trackUrl, url: e.trackUrl, category: "music", loop: e.loop ?? true, volume: e.volume },
            { fadeMs: e.fadeMs },
          );
        } else if (e.type === "audio:musicStopped") {
          port.stopMusic({ fadeMs: e.fadeMs });
        }
      }
    };

    const handle = (event: GameEvent) => {
      const out = resolveAudioEvents(event, ctxFor());
      dispatchAudio(out);

      // Actualizar previousMusicRef cuando la escena cambia
      if (event.type === "scene:changed") {
        previousMusicRef.current = event.scene.music;
      }
    };

    const subs = [
      runtime.on("scene:changed", handle),
      runtime.on("item:pickedUp", handle),
      runtime.on("item:dropped", handle),
      runtime.on("transition:triggered", handle),
      runtime.on("dialog:triggered", handle),
    ];

    // Sync inicial de settings hacia el port
    const applySettings = () => {
      const s = settingsStore.getState();
      port.setMuted("master", s.masterMuted);
      port.setMuted("music", s.musicMuted);
      port.setMuted("sfx", s.sfxMuted);
      port.setVolume("master", s.masterVolume);
      port.setVolume("music", s.musicVolume);
      port.setVolume("sfx", s.sfxVolume);
    };
    applySettings();
    const unsubSettings = settingsStore.subscribe(applySettings);

    return () => {
      subs.forEach((u) => u());
      unsubSettings();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.runtime, opts.port, opts.settingsStore]);
}
```

### Step 2 — Re-exportar

`packages/engine-renderer-r3f/src/index.ts`:

```typescript
export { useAudioSystem } from "./hooks/useAudioSystem";
```

### Step 3 — Tests

`packages/engine-renderer-r3f/src/__tests__/useAudioSystem.test.tsx`:

- Mock de runtime con `EventEmitter` mínimo.
- Usa `HeadlessAudioAdapter` como port.
- Verifica que tras `scene:changed` con música → `adapter.calls` contiene `playMusic` con la URL.
- `item:pickedUp` con override → `playSound` con la URL custom.
- Sin override y sin default → no se llama `playSound`.
- `settingsStore.setMasterMuted(true)` → `adapter.calls` contiene `setMuted("master", true)`.
- Cleanup al desmontar: no se llaman handlers tras unmount.

### Step 4 — Validación

```bash
cd packages/engine-renderer-r3f
npm run typecheck
npm test
```

---

## 📚 References

- `packages/engine-renderer-r3f/src/hooks/usePlayerWalkAnimation.ts` — patrón de hook que se suscribe al runtime.
- Task 11.5 — `resolveAudioEvents` que se llama aquí.
- Task 11.2 — `HeadlessAudioAdapter` para los tests.
