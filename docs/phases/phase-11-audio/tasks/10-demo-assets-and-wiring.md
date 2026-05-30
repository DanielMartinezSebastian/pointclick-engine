# Task 11.10 — Demo: assets free + wiring de escenas/items/transitions

**Effort**: 1.5h | **Blocks**: ninguna (cierra fase) | **Blocked by**: [11.5, 11.7, 11.8, 11.9]

---

## 🎯 Objetivo

Bajar sonidos de bancos gratuitos (Kenney, Pixabay, OpenGameArt), colocarlos en `apps/web-demo/public/assets/audio/`, registrar `LICENSES.md`, y cablear:

- Música distinta para 2+ escenas (`town`, `dungeon`, `personalRoom`).
- Defaults globales para pickup, drop, transition, click.
- Override custom para al menos 1 ítem (`gameboy` pickup) y 1 transición (puerta principal).

---

## ✅ Success Criteria

- [ ] Carpeta `apps/web-demo/public/assets/audio/` creada con subcarpetas `music/` y `sfx/`.
- [ ] Al menos 7 archivos descargados (3 música + 4 SFX).
- [ ] `LICENSES.md` con autor + licencia + URL por archivo.
- [ ] `apps/web-demo/demo-content/scenes/scenes.ts` actualizado: `music` configurada en 3 escenas.
- [ ] `apps/web-demo/demo-content/items/*` (o donde estén): `gameboy.pickupSoundUrl` configurado.
- [ ] Al menos una transición con `triggerSoundUrl` (ej. puerta a `personalRoom`).
- [ ] `AudioDefaultsConfig` cableado al runtime (donde se cree el runtime): `{ clickSoundUrl, pickupSoundUrl, dropSoundUrl, transitionSoundUrl }`.
- [ ] `useAudioSystem` invocado en el árbol R3F con `webAudioAdapter`.
- [ ] Manual smoke: en navegador todo suena.

---

## 📝 Instructions

### Step 1 — Descargar assets (uno cada vez, anota la URL exacta)

**Recomendaciones concretas (CC0 / Pixabay License):**

| Destino | Fuente sugerida |
|---|---|
| `sfx/click.ogg` | Kenney *UI Audio* → `click1.ogg`. https://kenney.nl/assets/ui-audio |
| `sfx/pickup-default.ogg` | Kenney *RPG Audio* → `bookFlip1.ogg`. https://kenney.nl/assets/rpg-audio |
| `sfx/drop-default.ogg` | Kenney *RPG Audio* → `cloth1.ogg`. |
| `sfx/transition-default.ogg` | Kenney *Sci-fi Sounds* → `doorOpen_1.ogg`. https://kenney.nl/assets/sci-fi-sounds |
| `sfx/pickup-gameboy.ogg` | Pixabay → buscar "8-bit power up" (Pixabay License). https://pixabay.com/sound-effects/search/8-bit/ |
| `sfx/door-personal-room.ogg` | Freesound CC0 → "wooden door creak". https://freesound.org/search/?f=license:%22Creative+Commons+0%22+door |
| `music/town-loop.mp3` | Pixabay → "casual game loop" (Pixabay License). https://pixabay.com/music/search/casual%20game/ |
| `music/dungeon-loop.mp3` | Pixabay → "ambient dungeon" o OpenGameArt CC-BY equivalente. |
| `music/personal-room.mp3` | Pixabay → "lofi loop" o "calm". |

**Importante**: si una pista es CC-BY (no CC0) → atribución obligatoria en `LICENSES.md`.

### Step 2 — `LICENSES.md`

`apps/web-demo/public/assets/audio/LICENSES.md`:

```markdown
# Audio assets — atribuciones y licencias

## SFX

| Archivo | Autor | Licencia | URL original |
|---|---|---|---|
| sfx/click.ogg | Kenney | CC0 | https://kenney.nl/assets/ui-audio |
| sfx/pickup-default.ogg | Kenney | CC0 | https://kenney.nl/assets/rpg-audio |
| sfx/drop-default.ogg | Kenney | CC0 | https://kenney.nl/assets/rpg-audio |
| sfx/transition-default.ogg | Kenney | CC0 | https://kenney.nl/assets/sci-fi-sounds |
| sfx/pickup-gameboy.ogg | <autor> | Pixabay License | <url exacta> |
| sfx/door-personal-room.ogg | <autor> | CC0 | <url freesound> |

## Música

| Archivo | Autor | Licencia | URL original |
|---|---|---|---|
| music/town-loop.mp3 | <autor> | Pixabay License | <url> |
| music/dungeon-loop.mp3 | <autor> | <licencia> | <url> |
| music/personal-room.mp3 | <autor> | <licencia> | <url> |
```

### Step 3 — Configurar escenas

En `apps/web-demo/demo-content/scenes/scenes.ts`:

```typescript
// Para cada escena con música:
export const townScene: GameScene = {
  // ... resto
  music: {
    trackUrl: "/assets/audio/music/town-loop.mp3",
    volume: 0.6,
    fadeMs: 800,
  },
};

export const dungeonScene: GameScene = {
  // ...
  music: {
    trackUrl: "/assets/audio/music/dungeon-loop.mp3",
    volume: 0.5,
    fadeMs: 1200,
  },
};

export const personalRoomScene: GameScene = {
  // ...
  music: {
    trackUrl: "/assets/audio/music/personal-room.mp3",
    persistAcrossScenes: false,
    volume: 0.55,
  },
};
```

### Step 4 — Configurar items y transiciones

Ej. ítem `gameboy`:

```typescript
{
  id: "gameboy",
  // ...
  pickupSoundUrl: "/assets/audio/sfx/pickup-gameboy.ogg",
}
```

Ej. transición a personal room:

```typescript
sceneTransitionOnItemDrop({
  // ...
  triggerSoundUrl: "/assets/audio/sfx/door-personal-room.ogg",
})
```

### Step 5 — Cablear defaults + adapter en el runtime

Donde se cree el runtime (probablemente `app/page.tsx` o `app/lib/engine/runtime/...`):

```typescript
import { webAudioAdapter } from "../lib/platform-web";
import { audioSettingsStore } from "../store/audio";
import { useAudioSystem } from "@pointclick-engine/engine-renderer-r3f";

const audioDefaults = {
  clickSoundUrl: "/assets/audio/sfx/click.ogg",
  pickupSoundUrl: "/assets/audio/sfx/pickup-default.ogg",
  dropSoundUrl: "/assets/audio/sfx/drop-default.ogg",
  transitionSoundUrl: "/assets/audio/sfx/transition-default.ogg",
};

// En el componente que monta el runtime:
useAudioSystem({
  runtime,
  port: webAudioAdapter,
  defaults: audioDefaults,
  scenes: scenesById,
  items: itemsById,
  transitions: transitionsById,
  settingsStore: audioSettingsStore,
});
```

### Step 6 — Validación manual

1. `npm run dev` en `apps/web-demo`.
2. Click cualquier sitio (desbloquea audio autoplay).
3. Música de town empieza con fade.
4. Pickup de gameboy suena con el SFX 8-bit custom.
5. Cambio a dungeon → crossfade a `dungeon-loop`.
6. Abrir inventario → mutear música → silencio; volver a habilitar → vuelve la música.
7. Refrescar página → mute persiste.

### Step 7 — Cerrar fase

- Marcar todas las tareas como `[x]` en `tracking.md`.
- Actualizar `MEMORY.md` con entrada `phase11-progress.md` (status, métricas).
- Commit final: `feat(phase-11): complete audio system phase`.

---

## 📚 References

- README de la fase → tabla de fuentes de sonido.
- Task 11.5 — defaults consumidos aquí.
- Task 11.7 — `webAudioAdapter` usado aquí.
- Task 11.8 — `useAudioSystem` cableado aquí.
- Kenney terms: https://kenney.nl/learn/license
- Pixabay terms: https://pixabay.com/service/license-summary/
- Freesound CC0: https://creativecommons.org/publicdomain/zero/1.0/
