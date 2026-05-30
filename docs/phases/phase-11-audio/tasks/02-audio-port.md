# Task 11.2 — Core Port: AudioPort + HeadlessAudioAdapter

**Effort**: 1h | **Blocks**: [11.5, 11.6, 11.7] | **Blocked by**: [11.1]

---

## 🎯 Objetivo

Definir el `AudioPort` en `packages/engine-core/src/ports/` siguiendo el patrón de `gameLoop`/`input`/`viewport`. Proveer un `HeadlessAudioAdapter` que registre llamadas para tests sin DOM.

---

## ✅ Success Criteria

- [ ] `packages/engine-core/src/ports/audio.ts` con interface `AudioPort`.
- [ ] `packages/engine-core/src/ports/headlessAudio.ts` con `HeadlessAudioAdapter` (no-op + log).
- [ ] Re-export desde `packages/engine-core/src/ports/index.ts`.
- [ ] Sin imports de `react`, `three`, `window`, `Audio`, `AudioContext` en estos archivos.
- [ ] `HeadlessAudioAdapter` registra llamadas inspeccionables: `adapter.calls` → `{ playSound, playMusic, stopMusic, setMuted, setVolume }[]`.
- [ ] Tipos exportados vía API pública.
- [ ] `tsc` pasa.

---

## 📝 Instructions

### Step 1 — Crear `packages/engine-core/src/ports/audio.ts`

```typescript
import type { SoundCategory, SoundDefinition } from "../game/types";

export type AudioMuteTarget = "master" | SoundCategory;

export interface AudioPlayOptions {
  /** Override de volumen 0..1 para esta reproducción concreta. */
  volume?: number;
}

export interface AudioMusicOptions {
  fadeMs?: number;
  volume?: number;
}

/**
 * Port abstracto para reproducción de audio.
 * El adapter web (HTMLAudio/Howler/WebAudio) lo implementa fuera de core.
 */
export interface AudioPort {
  playSound(def: SoundDefinition, opts?: AudioPlayOptions): void;
  playMusic(def: SoundDefinition, opts?: AudioMusicOptions): void;
  stopMusic(opts?: AudioMusicOptions): void;
  setMuted(target: AudioMuteTarget, muted: boolean): void;
  setVolume(target: AudioMuteTarget, volume: number): void;
  preload(urls: string[]): Promise<void>;
  dispose(): void;
}
```

### Step 2 — Crear `packages/engine-core/src/ports/headlessAudio.ts`

```typescript
import type {
  AudioMuteTarget,
  AudioMusicOptions,
  AudioPlayOptions,
  AudioPort,
} from "./audio";
import type { SoundDefinition } from "../game/types";

export type HeadlessAudioCall =
  | { type: "playSound"; def: SoundDefinition; opts?: AudioPlayOptions }
  | { type: "playMusic"; def: SoundDefinition; opts?: AudioMusicOptions }
  | { type: "stopMusic"; opts?: AudioMusicOptions }
  | { type: "setMuted"; target: AudioMuteTarget; muted: boolean }
  | { type: "setVolume"; target: AudioMuteTarget; volume: number }
  | { type: "preload"; urls: string[] }
  | { type: "dispose" };

export class HeadlessAudioAdapter implements AudioPort {
  readonly calls: HeadlessAudioCall[] = [];

  playSound(def: SoundDefinition, opts?: AudioPlayOptions): void {
    this.calls.push({ type: "playSound", def, opts });
  }
  playMusic(def: SoundDefinition, opts?: AudioMusicOptions): void {
    this.calls.push({ type: "playMusic", def, opts });
  }
  stopMusic(opts?: AudioMusicOptions): void {
    this.calls.push({ type: "stopMusic", opts });
  }
  setMuted(target: AudioMuteTarget, muted: boolean): void {
    this.calls.push({ type: "setMuted", target, muted });
  }
  setVolume(target: AudioMuteTarget, volume: number): void {
    this.calls.push({ type: "setVolume", target, volume });
  }
  async preload(urls: string[]): Promise<void> {
    this.calls.push({ type: "preload", urls });
  }
  dispose(): void {
    this.calls.push({ type: "dispose" });
  }

  reset(): void {
    this.calls.length = 0;
  }
}
```

### Step 3 — Re-exportar desde `packages/engine-core/src/ports/index.ts`

```typescript
export type {
  AudioMuteTarget,
  AudioMusicOptions,
  AudioPlayOptions,
  AudioPort,
} from "./audio";
export {
  HeadlessAudioAdapter,
  type HeadlessAudioCall,
} from "./headlessAudio";
```

### Step 4 — Validación

```bash
cd packages/engine-core
npm run typecheck
grep -rn "window\.\|document\.\|new Audio\|AudioContext\|import.*react" src/ports/audio.ts src/ports/headlessAudio.ts  # vacío
```

---

## 📚 References

- `packages/engine-core/src/ports/gameLoop.ts` — patrón de puerto.
- `packages/engine-core/src/ports/headlessGameLoop.ts` — patrón de headless adapter.
- `docs/architecture/04-platform-ports.md` — convención ports/adapters.
