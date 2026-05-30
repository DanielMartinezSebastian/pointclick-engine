# Task 11.1 — Core Types: SoundDefinition + audio fields

**Effort**: 1h | **Blocks**: [11.2, 11.3, 11.4, 11.5] | **Blocked by**: ninguna

---

## 🎯 Objetivo

Definir en `engine-core` los tipos base de audio (`SoundDefinition`, `SoundCategory`, `SceneMusicConfig`, `AudioSettings`) y añadir campos opcionales de audio a `GameScene`, `ItemDefinition`, `ItemInteractionRule` y `BaseSceneTransition`. Todo opcional → backward compatible.

---

## ✅ Success Criteria

- [ ] `SoundCategory = "music" | "sfx" | "ui" | "ambient"` exportado.
- [ ] `SoundDefinition` con `id`, `url`, `volume?`, `loop?`, `category`.
- [ ] `SceneMusicConfig` con `trackUrl`, `persistAcrossScenes?`, `volume?`, `fadeMs?`.
- [ ] `AudioSettings` con `masterMuted`, `musicMuted`, `sfxMuted`, `masterVolume`, `musicVolume`, `sfxVolume`, `currentMusicTrackUrl?`.
- [ ] `GameScene.music?: SceneMusicConfig` añadido.
- [ ] `ItemDefinition.pickupSoundUrl?` y `dropSoundUrl?` añadidos.
- [ ] `ItemInteractionRule.dropSoundUrl?` añadido (override por interacción).
- [ ] `BaseSceneTransition.triggerSoundUrl?` añadido.
- [ ] Tipos exportados desde `packages/engine-core/src/index.ts`.
- [ ] `tsc` pasa en `packages/engine-core`.
- [ ] `grep -r "import.*react\|from 'three'\|window\.\|new Audio" packages/engine-core/src/game/types/` → vacío.

---

## 📝 Instructions

### Step 1 — Editar `packages/engine-core/src/game/types/index.ts`

Añadir al final del archivo (antes de los `RuntimeEvent`):

```typescript
// ---------------------------------------------------------------------------
// Audio
// ---------------------------------------------------------------------------

export type SoundCategory = "music" | "sfx" | "ui" | "ambient";

export interface SoundDefinition {
  id: string;
  url: string;
  /** 0..1, default 1. */
  volume?: number;
  /** Default false para SFX, true implícito para música. */
  loop?: boolean;
  category: SoundCategory;
}

export interface SceneMusicConfig {
  trackUrl: string;
  /** Si true, no se reinicia al cambiar de escena hasta entrar a otra con música distinta. */
  persistAcrossScenes?: boolean;
  /** 0..1, default 1. */
  volume?: number;
  /** Crossfade en ms al entrar/salir. Default 800. */
  fadeMs?: number;
}

export interface AudioSettings {
  masterMuted: boolean;
  musicMuted: boolean;
  sfxMuted: boolean;
  /** 0..1 cada uno. */
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  /** Track actualmente sonando (para restaurar tras unmute / reload). */
  currentMusicTrackUrl?: string;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterMuted: false,
  musicMuted: false,
  sfxMuted: false,
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
};
```

### Step 2 — Añadir campos opcionales a tipos existentes

En el mismo archivo:

```typescript
export interface GameScene {
  // ... campos existentes
  /** Música opcional asociada a esta escena. */
  music?: SceneMusicConfig;
}

export interface ItemDefinition {
  // ... campos existentes
  /** Override del SFX por defecto al recoger este ítem. */
  pickupSoundUrl?: string;
  /** Override del SFX por defecto al soltar este ítem. */
  dropSoundUrl?: string;
}

export interface ItemInteractionRule {
  // ... campos existentes
  /** Override del SFX por defecto al hacer drop en esta interacción concreta. */
  dropSoundUrl?: string;
}

export interface BaseSceneTransition {
  // ... campos existentes
  /** Override del SFX por defecto al disparar esta transición. */
  triggerSoundUrl?: string;
}
```

### Step 3 — Exportar desde la API pública

`packages/engine-core/src/index.ts` ya hace `export * from "./game/types"`, así que los nuevos tipos saldrán automáticamente. Verificar:

```bash
cd packages/engine-core && npm run build
node -e "console.log(Object.keys(require('./dist/index.js')))" | grep -i audio
```

### Step 4 — Validación

```bash
cd packages/engine-core
npm run typecheck
grep -rn "new Audio\|AudioContext\|window\.\|document\." src/game/types/  # debe estar vacío
```

---

## 📚 References

- `docs/architecture/03-rules-core-vs-render.md` — los tipos viven en core.
- `docs/phases/phase-11-audio/README.md` — sección "Diseño rápido / 1".
- Phase 10 task 10.1 — patrón de añadir campos opcionales sin romper compat.
