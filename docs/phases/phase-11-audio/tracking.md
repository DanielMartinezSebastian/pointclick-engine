# Phase 11 — Progress Tracking

**Phase**: 11 — Audio System
**Status**: Planned
**Started**: —
**Completed**: —

---

## Sprint 1 — Core agnóstico

- [x] [11.1 — Core types: SoundDefinition + audio fields](tasks/01-core-types.md)
- [x] [11.2 — Core port: AudioPort + HeadlessAudioAdapter](tasks/02-audio-port.md)
- [x] [11.3 — Core state: audioSettingsStore + persistencia](tasks/03-audio-settings-store.md)
- [x] [11.4 — Core commands + events de audio](tasks/04-commands-and-events.md)
- [x] [11.5 — Core: audioRules processor + defaults](tasks/05-audio-rules-processor.md)
- [ ] [11.6 — Core tests: store + rules + headless](tasks/06-core-tests.md)

## Sprint 2 — Platform + renderer

- [ ] [11.7 — Platform: webAudioAdapter](tasks/07-web-audio-adapter.md)
- [ ] [11.8 — R3F: useAudioSystem hook](tasks/08-r3f-audio-hook.md)

## Sprint 3 — UI + demo

- [ ] [11.9 — UI: mute controls en InventoryUI](tasks/09-inventory-mute-controls.md)
- [ ] [11.10 — Demo: assets free + wiring](tasks/10-demo-assets-and-wiring.md)

---

## Post-Phase Checklist

- [ ] All tests passing (`npm run test`)
- [ ] Type-check passing
- [ ] Build passing
- [ ] `grep -r "new Audio\|AudioContext\|window\.\|document\." packages/engine-core/src/` → vacío
- [ ] Backward compatibility: escenas/items sin audio funcionan
- [ ] Persistencia de mute/volumen verificada (recarga manual)
- [ ] Demo: 2+ escenas con música, 1+ ítem con SFX custom, 1+ transición con SFX
- [ ] `LICENSES.md` de audio creado con atribuciones
- [ ] Arquitectura respetada (Core agnóstico, R3F renderer-specific, UI presentación)

---

## Deliverables esperados

### Core (engine-core) — ~840 LOC
- Types: `SoundDefinition`, `SceneMusicConfig`, `AudioSettings`, `SoundCategory`
- Port: `AudioPort` + `HeadlessAudioAdapter`
- State: `audioSettingsStore` + storage adapter integration
- Commands: `audio:playSfx`, `audio:setMuted`, `audio:setVolume`
- Events: `audio:sfxRequested`, `audio:musicRequested`, `audio:musicStopped`, `audio:settingsChanged`
- Rules processor: `audioRules.ts` + `AudioDefaultsConfig`
- Tests: ≥30 tests nuevos

### Renderer R3F (engine-renderer-r3f) — ~150 LOC
- Hook: `useAudioSystem(runtime, adapter, defaults)`
- Suscripción a eventos del runtime → reproducción vía port
- Integración en `GameTouchSpriteRuntime`

### Platform (web-demo) — ~220 LOC
- `webAudioAdapter` en `platform-web.ts`
- Manejo de fade in/out, pooling de instancias, autoplay-policy

### UI (web-demo) — ~120 LOC
- Tres toggles en `InventoryUI` (master / música / SFX)
- Estado leído del store, despachan commands

### Demo content — ~80 LOC + assets
- Música configurada en `town`, `dungeon`, `personalRoom`
- SFX custom para al menos un ítem (ej. `gameboy` pickup)
- SFX de transición en al menos una puerta
- `apps/web-demo/public/assets/audio/LICENSES.md`

---

## Timeline (a rellenar al ejecutar)

| Fecha | Task | Status |
|------|------|--------|
| 2026-05-30 | Plan creado | ⏳ |
