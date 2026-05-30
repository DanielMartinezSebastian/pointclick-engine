# Task 11.4 — Core commands + events de audio

**Effort**: 30min | **Blocks**: [11.5, 11.8, 11.9] | **Blocked by**: [11.1]

---

## 🎯 Objetivo

Extender los uniones `GameCommand` y `GameEvent` con las variantes de audio. Sin handlers todavía (eso es la task 11.5); aquí sólo tipos.

---

## ✅ Success Criteria

- [ ] `GameCommand` incluye `audio:playSfx`, `audio:setMuted`, `audio:setVolume`.
- [ ] `GameEvent` incluye `audio:sfxRequested`, `audio:musicRequested`, `audio:musicStopped`, `audio:settingsChanged`.
- [ ] Discriminantes (`type`) usan el namespace `audio:`.
- [ ] Re-exportan desde la API pública.
- [ ] `tsc` pasa.

---

## 📝 Instructions

### Step 1 — Editar `packages/engine-core/src/game/commands/types.ts`

Añadir a la unión `GameCommand`:

```typescript
import type { AudioMuteTarget } from "../../ports";
import type { AudioSettings, SoundCategory } from "../types";

// ... unión existente
  | { type: "audio:playSfx"; soundUrl: string; category?: SoundCategory; volume?: number }
  | { type: "audio:setMuted"; target: AudioMuteTarget; muted: boolean }
  | { type: "audio:setVolume"; target: AudioMuteTarget; volume: number };
```

Si la importación circular `ports → types` da problemas, usa el tipo inline:

```typescript
type AudioMuteTarget = "master" | "music" | "sfx" | "ui" | "ambient";
```

(Documenta brevemente como comentario por qué se duplica.)

### Step 2 — Editar `packages/engine-core/src/game/events/types.ts`

Añadir a la unión `GameEvent`:

```typescript
import type { AudioSettings, SoundCategory } from "../types";

// ... unión existente
  // Audio
  | { type: "audio:sfxRequested"; soundUrl: string; category: SoundCategory; volume?: number }
  | { type: "audio:musicRequested"; trackUrl: string; fadeMs?: number; volume?: number; loop?: boolean }
  | { type: "audio:musicStopped"; fadeMs?: number }
  | { type: "audio:settingsChanged"; settings: AudioSettings };
```

### Step 3 — Validación

```bash
cd packages/engine-core
npm run typecheck
```

Y un grep de coherencia:

```bash
grep -rn "audio:" packages/engine-core/src/game/ | head -20
```

---

## 📚 References

- `packages/engine-core/src/game/commands/types.ts` — ubicación.
- `packages/engine-core/src/game/events/types.ts` — ubicación.
- Task 11.5 — usará estos tipos para el rules processor.
