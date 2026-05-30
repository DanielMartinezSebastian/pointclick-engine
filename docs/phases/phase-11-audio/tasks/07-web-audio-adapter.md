# Task 11.7 — Platform: webAudioAdapter en platform-web

**Effort**: 2h | **Blocks**: [11.8] | **Blocked by**: [11.2, 11.3]

---

## 🎯 Objetivo

Implementar `webAudioAdapter` (clase `WebAudioAdapter`) en `apps/web-demo/app/lib/platform-web.ts` (o un nuevo `platform-web-audio.ts` si el archivo crece demasiado). Usar **`HTMLAudioElement`** (cero deps nuevas) con pool de instancias para SFX simultáneos y crossfade básico para música. Persistencia integrada vía `localStorageAdapter`.

---

## ✅ Success Criteria

- [ ] Clase `WebAudioAdapter` implementa `AudioPort` de `@pointclick-engine/engine-core`.
- [ ] SFX: pool reutilizable (`Map<url, HTMLAudioElement[]>`) — máximo 4 instancias por URL.
- [ ] Música: una única instancia activa con crossfade in/out por `volume`.
- [ ] `setMuted("master", true)` silencia todo inmediatamente.
- [ ] `setMuted("music", true)` baja vol de música a 0 pero no la para (se restaura al desmute).
- [ ] `setVolume("sfx", v)` ajusta vol base de futuras llamadas a `playSound` con `category sfx/ui/ambient`.
- [ ] `preload(urls)` crea elementos `<audio preload="auto">` y resuelve cuando todos `canplaythrough` o pasan 5s.
- [ ] Maneja **autoplay policy**: si `play()` lanza `NotAllowedError`, encola y retry tras el primer `pointerdown` global.
- [ ] `dispose()` para todos los elementos y libera el pool.
- [ ] SSR-safe: si `typeof window === "undefined"`, todas las operaciones son no-op (degradación graceful).
- [ ] Persistencia: helper `bindAudioPersistence(store, storage)` que carga settings al iniciar y los guarda en cada cambio (debounced 250 ms).

---

## 📝 Instructions

### Step 1 — Crear `apps/web-demo/app/lib/platform-web-audio.ts`

(Archivo nuevo para mantener `platform-web.ts` legible.)

Esqueleto:

```typescript
import type {
  AudioMuteTarget,
  AudioMusicOptions,
  AudioPlayOptions,
  AudioPort,
} from "@pointclick-engine/engine-core";
import type { SoundDefinition, SoundCategory } from "@pointclick-engine/engine-core";

const POOL_SIZE = 4;
const DEFAULT_FADE_MS = 800;

interface MuteState {
  master: boolean;
  music: boolean;
  sfx: boolean;
}

interface VolumeState {
  master: number;
  music: number;
  sfx: number;
}

export class WebAudioAdapter implements AudioPort {
  private readonly isBrowser = typeof window !== "undefined";
  private readonly sfxPool = new Map<string, HTMLAudioElement[]>();
  private musicEl: HTMLAudioElement | null = null;
  private musicUrl: string | undefined;
  private mute: MuteState = { master: false, music: false, sfx: false };
  private vol: VolumeState = { master: 0.8, music: 0.6, sfx: 0.8 };
  private pendingPlay: Array<() => void> = [];
  private unlocked = false;

  constructor() {
    if (this.isBrowser) {
      const unlock = () => {
        this.unlocked = true;
        this.pendingPlay.forEach((fn) => fn());
        this.pendingPlay = [];
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    }
  }

  // ... implementar playSound, playMusic, stopMusic, setMuted, setVolume, preload, dispose
}

export const webAudioAdapter = new WebAudioAdapter();
```

Detalles importantes a implementar:

1. **playSound**: busca pool para `def.url`, encuentra primer `<audio>` con `paused || ended` o crea uno nuevo (hasta `POOL_SIZE`). Setea `currentTime = 0`, ajusta `volume = effectiveVolume(category)` y llama `play()`. Si `play()` rechaza, encola en `pendingPlay`.

2. **playMusic**: si `this.musicEl` apunta a otra URL → crossfade (intervalo de pasos cada 50ms reduciendo `volume` del actual y subiendo del nuevo). Si misma URL → no reiniciar.

3. **stopMusic**: fade out de `musicEl.volume → 0`, luego `pause()`.

4. **effectiveVolume**: replica la lógica de `getEffectiveVolume` del store usando `mute`/`vol` locales (sincronizados via `setMuted`/`setVolume`).

5. **preload**: `Promise.all(urls.map(url => new Promise(resolve => { const a = new Audio(url); a.preload = "auto"; a.addEventListener("canplaythrough", resolve, { once: true }); setTimeout(resolve, 5000); a.load(); })))`.

### Step 2 — Helper de persistencia

En el mismo archivo:

```typescript
import {
  loadAudioSettings,
  saveAudioSettings,
  type AudioSettingsStore,
} from "@pointclick-engine/engine-core";
import { localStorageAdapter } from "./platform-web";

export function bindAudioPersistence(store: AudioSettingsStore): () => void {
  const persisted = loadAudioSettings(localStorageAdapter);
  if (persisted) store.hydrate(persisted);

  let timeout: ReturnType<typeof setTimeout> | null = null;
  const unsubscribe = store.subscribe((settings) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => saveAudioSettings(localStorageAdapter, settings), 250);
  });

  return () => {
    if (timeout) clearTimeout(timeout);
    unsubscribe();
  };
}
```

### Step 3 — Exportar desde `platform-web.ts`

```typescript
export { webAudioAdapter, WebAudioAdapter, bindAudioPersistence } from "./platform-web-audio";
```

### Step 4 — Tests rápidos (smoke)

Añadir a `apps/web-demo/app/lib/platform-web.test.ts` (o nuevo `platform-web-audio.test.ts`) al menos:

- `webAudioAdapter` es no-op en jsdom sin `window` (skip si jsdom siempre da window).
- `setMuted` actualiza estado interno (chequear vía side-effect: `playSound` resulta en `volume=0`).
- `preload([])` resuelve sin error.
- `bindAudioPersistence` aplica settings al hidratar.

### Step 5 — Validación

```bash
cd apps/web-demo
npm run typecheck
npm run test
```

---

## 📚 References

- `apps/web-demo/app/lib/platform-web.ts` — patrón de adapters web.
- Task 11.2 — definición de `AudioPort`.
- Task 11.3 — `loadAudioSettings`/`saveAudioSettings`.
- MDN: [HTMLMediaElement.play() autoplay policy](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play#exceptions).
