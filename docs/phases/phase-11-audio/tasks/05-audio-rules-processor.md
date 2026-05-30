# Task 11.5 — Core audioRules processor + defaults

**Effort**: 2h | **Blocks**: [11.6, 11.8] | **Blocked by**: [11.1, 11.2, 11.3, 11.4]

---

## 🎯 Objetivo

Crear `audioRules.ts` en core: un procesador puro que recibe eventos del juego (`scene:changed`, `item:pickedUp`, `item:dropped`, `transition:triggered`, etc.) y devuelve eventos de audio (`audio:sfxRequested`, `audio:musicRequested`). Los defaults se inyectan al runtime mediante `AudioDefaultsConfig`.

---

## ✅ Success Criteria

- [ ] `packages/engine-core/src/game/logic/rules/audioRules.ts` creado.
- [ ] `AudioDefaultsConfig` type con campos opcionales: `clickSoundUrl?`, `pickupSoundUrl?`, `dropSoundUrl?`, `transitionSoundUrl?`, `dialogSoundUrl?`.
- [ ] Función `resolveAudioEvents(event, ctx) → GameEvent[]` pura.
- [ ] Resuelve override-vs-default en este orden de prioridad:
  1. Sonido específico del ítem/interacción/transición (si está configurado)
  2. Default global (de `AudioDefaultsConfig`)
  3. Si ningún default → no emite (silencio)
- [ ] Música de escena resuelta con `scene.music`. Si `persistAcrossScenes:true` y la siguiente escena no tiene música → no detiene la actual.
- [ ] `setSceneAudioContext(scene, items, transitions)` para que el procesador conozca los recursos de la escena actual.
- [ ] Exportada desde `packages/engine-core/src/game/logic/index.ts`.
- [ ] `tsc` pasa. Sin imports de React/three/window.

---

## 📝 Instructions

### Step 1 — Crear `audioRules.ts`

`packages/engine-core/src/game/logic/rules/audioRules.ts`:

```typescript
import type { GameEvent } from "../../events";
import type {
  GameScene,
  ItemDefinition,
  GameSceneTransition,
  SceneMusicConfig,
} from "../../types";

export interface AudioDefaultsConfig {
  clickSoundUrl?: string;
  pickupSoundUrl?: string;
  dropSoundUrl?: string;
  transitionSoundUrl?: string;
  dialogSoundUrl?: string;
}

export interface AudioRulesContext {
  defaults: AudioDefaultsConfig;
  currentScene?: GameScene;
  previousMusic?: SceneMusicConfig;
  items: Record<string, ItemDefinition>;
  transitions: Record<string, GameSceneTransition>;
}

/**
 * Pure resolver: dado un evento del juego, devuelve los eventos de audio derivados.
 * El runtime se encarga de propagarlos al EventBus.
 */
export function resolveAudioEvents(
  event: GameEvent,
  ctx: AudioRulesContext,
): GameEvent[] {
  switch (event.type) {
    case "scene:changed": {
      const music = event.scene.music;
      const out: GameEvent[] = [];
      if (music) {
        // Cambia/inicia música
        out.push({
          type: "audio:musicRequested",
          trackUrl: music.trackUrl,
          fadeMs: music.fadeMs ?? 800,
          volume: music.volume,
          loop: true,
        });
      } else if (ctx.previousMusic && !ctx.previousMusic.persistAcrossScenes) {
        // La escena anterior tenía música no-persistente y la nueva no tiene → parar
        out.push({ type: "audio:musicStopped", fadeMs: 600 });
      }
      return out;
    }

    case "item:pickedUp": {
      const item = ctx.items[event.itemId];
      const url = item?.pickupSoundUrl ?? ctx.defaults.pickupSoundUrl;
      if (!url) return [];
      return [{ type: "audio:sfxRequested", soundUrl: url, category: "sfx" }];
    }

    case "item:dropped": {
      const item = ctx.items[event.itemId];
      // Prioridad: interacción específica > item > default
      const url = item?.dropSoundUrl ?? ctx.defaults.dropSoundUrl;
      if (!url) return [];
      return [{ type: "audio:sfxRequested", soundUrl: url, category: "sfx" }];
    }

    case "transition:triggered": {
      const t = ctx.transitions[event.transitionId];
      const url = t?.triggerSoundUrl ?? ctx.defaults.transitionSoundUrl;
      if (!url) return [];
      return [{ type: "audio:sfxRequested", soundUrl: url, category: "sfx" }];
    }

    case "dialog:triggered": {
      const url = ctx.defaults.dialogSoundUrl;
      if (!url) return [];
      return [{ type: "audio:sfxRequested", soundUrl: url, category: "ui" }];
    }

    default:
      return [];
  }
}

/** Helper para el host: SFX de click manual (ej. botón de inventario). */
export function clickSfxEvent(
  defaults: AudioDefaultsConfig,
  override?: string,
): GameEvent | null {
  const url = override ?? defaults.clickSoundUrl;
  if (!url) return null;
  return { type: "audio:sfxRequested", soundUrl: url, category: "ui" };
}
```

### Step 2 — Re-exportar

`packages/engine-core/src/game/logic/rules/index.ts`:

```typescript
export {
  resolveAudioEvents,
  clickSfxEvent,
  type AudioDefaultsConfig,
  type AudioRulesContext,
} from "./audioRules";
```

Verifica que `packages/engine-core/src/game/logic/index.ts` re-exporte de `./rules`.

### Step 3 — Validación

```bash
cd packages/engine-core
npm run typecheck
grep -rn "import.*react\|from 'three'\|window\.\|new Audio" src/game/logic/rules/audioRules.ts  # vacío
```

---

## 📚 References

- `packages/engine-core/src/game/logic/rules/transitionRules.ts` — patrón de rules processor puro.
- `docs/architecture/03-rules-core-vs-render.md` — rules viven en core.
- Task 11.6 — testea estas resoluciones.
