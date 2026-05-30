# Phase 11 — Audio System (música + SFX + mute en inventario)

**Status**: Planned | **Owner**: Daniel Martínez Sebastián | **Version target**: v0.3.0

**Planned**: 2026-05-30

---

## 🎯 Why

El motor no tiene capa de audio. Para una demo point-and-click sin sonido la experiencia es plana, y para una librería publicable el audio es contrato esperado. Esta fase introduce:

- **Música por escena** (cambia al hacer transición) y/o **música global** (continua entre escenas).
- **SFX** para click, pickup, drop, scene-change, abrir puertas / activar transiciones.
- **Overrides por ítem o interacción** (sonido propio que sustituye el default).
- **Mute desde el inventario** con controles separados para música y SFX.
- **Persistencia** de la configuración (mute, volumen) en `localStorage` vía port.

**Principio de la fase**: Core sigue siendo agnóstico (sin `Audio`, `AudioContext`, `Howler`, etc.). Se introduce un nuevo `AudioPort` que el adapter web implementa, igual que ya hacemos con `StoragePort`/`TimerPort`.

---

## 📋 Diseño rápido

### 1. Tipos en core

```typescript
// Una pieza de audio (música o SFX), con metadata mínima.
export interface SoundDefinition {
  /** Identificador estable. */
  id: string;
  /** URL al asset (mp3/ogg/wav). */
  url: string;
  /** Volumen base 0..1. Default 1. */
  volume?: number;
  /** Si es música (loop). Default false para SFX. */
  loop?: boolean;
  /** Categoría — se usa para mute selectivo. */
  category: "music" | "sfx" | "ui" | "ambient";
}

// Música asociada a una escena.
export interface SceneMusicConfig {
  /** Track principal de la escena. */
  trackUrl: string;
  /** Si true, la música se mantiene aunque cambies de escena. Default false. */
  persistAcrossScenes?: boolean;
  /** Volumen base 0..1. */
  volume?: number;
  /** Crossfade en ms al entrar/salir. Default 800. */
  fadeMs?: number;
}

// Sonidos asociados a items / interacciones / transiciones.
export interface ItemAudioConfig {
  pickupSoundUrl?: string;
  dropSoundUrl?: string;
}

export interface TransitionAudioConfig {
  triggerSoundUrl?: string;
}
```

Se añadirán **campos opcionales** a `GameScene`, `ItemDefinition`, `ItemInteractionRule` y `BaseSceneTransition` para enganchar sonidos. Todo opcional → backward compatible.

### 2. AudioPort (nuevo puerto en `engine-core/src/ports/`)

```typescript
export interface AudioPort {
  playSound(def: SoundDefinition): void;
  playMusic(def: SoundDefinition, opts?: { fadeMs?: number }): void;
  stopMusic(opts?: { fadeMs?: number }): void;
  setMuted(category: SoundCategory | "master", muted: boolean): void;
  setVolume(category: SoundCategory | "master", volume: number): void;
  preload(urls: string[]): Promise<void>;
  dispose(): void;
}
```

Headless adapter para tests (no-op + grabación de llamadas).

### 3. State en core

`audioSettingsStore.ts` — un store dedicado con:

```typescript
{
  masterMuted: boolean;
  musicMuted: boolean;
  sfxMuted: boolean;
  masterVolume: number;       // 0..1
  musicVolume: number;
  sfxVolume: number;
  currentMusicTrackUrl?: string;
}
```

Setters + suscripción + serialización a `StoragePort` (clave `audio-settings`).

### 4. Eventos y comandos en core

```typescript
// Events (emitidos por core)
| { type: "audio:sfxRequested"; soundUrl: string; category: SoundCategory }
| { type: "audio:musicRequested"; trackUrl: string; fadeMs?: number }
| { type: "audio:musicStopped" }
| { type: "audio:settingsChanged"; settings: AudioSettings }

// Commands (consumidos por core)
| { type: "audio:playSfx"; soundUrl: string; category?: SoundCategory }
| { type: "audio:setMuted"; category: "master" | SoundCategory; muted: boolean }
| { type: "audio:setVolume"; category: "master" | SoundCategory; volume: number }
```

### 5. Auto-wiring en core (rules processor)

Un nuevo procesador escucha eventos existentes y los traduce a `audio:sfxRequested` / `audio:musicRequested`:

| Evento de juego | Acción de audio |
|---|---|
| `scene:changed` | Resolver música de la escena nueva. Si tiene `music`, emit `audio:musicRequested`. Si la anterior tenía `persistAcrossScenes:true` y la nueva no define música, mantener. |
| `item:pickedUp` | `audio:sfxRequested(item.pickupSoundUrl ?? defaults.pickup)` |
| `item:dropped` | `audio:sfxRequested(item.dropSoundUrl ?? defaults.drop)` |
| `transition:triggered` | `audio:sfxRequested(transition.triggerSoundUrl ?? defaults.transition)` |
| `dialog:triggered` | (opcional) `audio:sfxRequested(defaults.dialog)` |

Los defaults (`defaults.pickup`, etc.) son **configurables** al crear el runtime — los aporta el host (demo), no el core.

### 6. Renderer / Platform (web)

- **Adapter**: `webAudioAdapter` en `apps/web-demo/app/lib/platform-web.ts` usando `HTMLAudioElement` (Howler.js sólo si justificamos la dep extra).
- **Hook R3F**: `useAudioSystem(runtime, adapter, defaults)` — se suscribe a los eventos de audio del runtime y los reproduce vía `AudioPort`. Vive en `engine-renderer-r3f/src/hooks/`.
- **Persistencia**: al iniciar, lee `StoragePort` → restaura `AudioSettings` en el store.

### 7. UI — controles en inventario

Tres toggles en el panel de inventario (encima del botón "Reiniciar"):

- 🔊/🔇 **Sonido** (master)
- 🎵/🔇 **Música**
- 🔔/🔇 **Efectos**

Despachan `audio:setMuted`. Estado leído del `audioSettingsStore` vía `useGameState`.

---

## 🏗️ Arquitectura por capas

```
┌──────────────────────────────────────────────────┐
│ UI (apps/web-demo) — InventoryUI mute controls  │
├──────────────────────────────────────────────────┤
│ R3F (engine-renderer-r3f) — useAudioSystem hook │
├──────────────────────────────────────────────────┤
│ Core (engine-core) — types, state, events,      │
│   commands, AudioPort, audioRules processor     │
├──────────────────────────────────────────────────┤
│ Platform (web-demo) — webAudioAdapter           │
└──────────────────────────────────────────────────┘
```

**Regla de oro**: ningún `new Audio()`, `AudioContext`, `HTMLAudioElement` en `engine-core`. Sólo en el adapter web.

---

## 📊 Task Breakdown

| Task | Scope | Est. LOC |
|------|-------|----------|
| [11.1](tasks/01-core-types.md) | Core types: `SoundDefinition`, `SceneMusicConfig`, audio fields en scene/item/transition | +120 |
| [11.2](tasks/02-audio-port.md) | Core port: `AudioPort` interface + `HeadlessAudioAdapter` para tests | +130 |
| [11.3](tasks/03-audio-settings-store.md) | Core state: `audioSettingsStore` + serialización vía `StoragePort` | +180 |
| [11.4](tasks/04-commands-and-events.md) | Core commands + events de audio | +60 |
| [11.5](tasks/05-audio-rules-processor.md) | Core: procesador que traduce eventos del juego a eventos de audio + defaults config | +200 |
| [11.6](tasks/06-core-tests.md) | Tests core: store + rules processor + headless adapter | +250 |
| [11.7](tasks/07-web-audio-adapter.md) | Platform: `webAudioAdapter` en `platform-web.ts` (`HTMLAudio` + fade + pool) | +220 |
| [11.8](tasks/08-r3f-audio-hook.md) | R3F: `useAudioSystem` hook + integración en `GameTouchSpriteRuntime` | +150 |
| [11.9](tasks/09-inventory-mute-controls.md) | UI: toggles de mute (master/música/SFX) en `InventoryUI` | +120 |
| [11.10](tasks/10-demo-assets-and-wiring.md) | Demo: descarga sonidos free, configura escenas/items/transitions | +80 |

**Total**: ~1500 LOC | **Est. tiempo**: 4-5 horas

---

## ✅ Success Criteria

- [ ] Las 10 tareas completadas y trackeadas en `tracking.md`.
- [ ] `engine-core` no importa nada de `Audio`/`window`/`document` (grep limpio).
- [ ] `SoundDefinition`, `SceneMusicConfig`, `AudioSettings` exportados desde la API pública.
- [ ] `AudioPort` definido en core; `HeadlessAudioAdapter` permite tests sin DOM.
- [ ] `webAudioAdapter` reproduce SFX correctamente (latencia < 50 ms tras gesture).
- [ ] Cambio de escena con `music` configurada → crossfade.
- [ ] Música con `persistAcrossScenes: true` no se reinicia entre escenas.
- [ ] Items con `pickupSoundUrl` override usan ese sonido; resto usan default.
- [ ] Toggles de mute en inventario funcionan independientemente (master/música/SFX).
- [ ] Estado de mute y volumen **persiste** entre recargas (localStorage).
- [ ] Backward compatible: escenas/items sin audio configurado siguen funcionando sin error.
- [ ] Tests pasando: ≥ 30 nuevos tests (store + rules + adapter headless).
- [ ] Demo: al menos 2 escenas con música distinta, 1 ítem con pickup custom, 1 transición con sonido custom.

---

## 🎧 Bancos de sonido gratuitos (placeholder assets)

Para los assets de prueba se proponen estas fuentes (todas con licencia compatible con redistribución):

| Fuente | Licencia | URL | Uso recomendado |
|---|---|---|---|
| **Kenney.nl** | CC0 (dominio público) | https://kenney.nl/assets?q=audio | Click UI, pickup, drop. Packs *UI Audio*, *Interface Sounds*, *RPG Audio*. |
| **OpenGameArt.org** | CC0 / CC-BY (filtrar) | https://opengameart.org/art-search-advanced?field_art_type_tid%5B%5D=13 | Música ambient, loops por escena. |
| **Freesound.org** | CC0 / CC-BY / CC-BY-NC (filtrar a CC0) | https://freesound.org/search/?f=license:%22Creative+Commons+0%22 | SFX puntuales (pasos, puertas, monedas). |
| **Pixabay Sound Effects** | Pixabay License (gratis comercial, sin atribución) | https://pixabay.com/sound-effects/ | Música y SFX casual/8-bit. |
| **Mixkit Free Sound Effects** | Mixkit License (gratis comercial) | https://mixkit.co/free-sound-effects/ | UI clicks, notifs. |

**Búsquedas concretas sugeridas** (la tarea 11.10 desarrolla esto):

- Click UI → Kenney *Interface Sounds 1* / *click1.ogg..click5.ogg* (CC0).
- Pickup → Kenney *RPG Audio* / *handleCoins.ogg*, *bookFlip1.ogg* (CC0).
- Drop → Kenney *RPG Audio* / *cloth1.ogg..cloth4.ogg* (CC0).
- Scene transition (door) → Freesound CC0 *door open*, o Kenney *door_open.ogg*.
- Música por escena (loop ambient) → OpenGameArt *Calm BGM Pack* (CC-BY) o Pixabay *Lo-Fi Loop*.

**Estructura propuesta en `public/`**:

```
apps/web-demo/public/assets/audio/
├── music/
│   ├── town-loop.mp3
│   ├── dungeon-loop.mp3
│   └── personal-room.mp3
├── sfx/
│   ├── click.ogg
│   ├── pickup-default.ogg
│   ├── drop-default.ogg
│   ├── transition-default.ogg
│   ├── door-open.ogg
│   └── pickup-gameboy.ogg   ← override custom
└── LICENSES.md              ← atribuciones por archivo
```

**NOTA**: cada archivo debe llevar entrada en `LICENSES.md` con autor + licencia + URL original — incluso CC0 conviene documentarlo.

---

## 🔄 Phases Dependency Chain

```
Phase 10 (Entry Positions + Pathwalking) ✅ DONE
        ↓
Phase 11 (Audio System) ← THIS PHASE
        ↓
Phase 12+ (Settings UI completa, accesibilidad, voice-over)
```

---

## 📚 Out of Scope (futuras fases)

- Voice-over para diálogos.
- Spatial audio (3D positional sound según distancia al player).
- Mixer/ducking dinámico (bajar música cuando habla un NPC).
- Editor visual de sonidos por escena.
- Streaming HLS / formatos avanzados.
- Subtítulos sincronizados.

---

## ❓ Open Questions

1. **Librería**: ¿`HTMLAudioElement` puro o `Howler.js`? Recomendación: empezar con HTMLAudio (cero deps); si necesitamos crossfade fino / pooling robusto → Howler en fase 12.
2. **Autoplay policy**: navegadores bloquean audio hasta el primer gesto del usuario. ¿Mostrar overlay "Click para empezar" o esperar al primer click in-game? Recomendación: usar el primer click ya existente (el de moverse) para desbloquear, sin overlay extra.
3. **Pre-carga**: ¿pre-cargar toda la música al boot o lazy on scene-change? Recomendación: lazy con `preload` triggered por `scene:willChange`.
4. **Defaults globales**: ¿se pasan al `createGameRuntime({ audioDefaults })` o se registran como un `defaultRule` separado? Recomendación: pasarlos al runtime para mantener simetría con `items`/`scenes`.

---

## 📝 Changelog

| Fecha | Acción |
|-------|--------|
| 2026-05-30 | Phase 11 planning (audio system + mute en inventario) |
