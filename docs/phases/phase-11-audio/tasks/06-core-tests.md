# Task 11.6 — Tests core: store + rules + headless adapter

**Effort**: 1.5h | **Blocks**: ninguna en sprint 1 | **Blocked by**: [11.3, 11.5, 11.2]

---

## 🎯 Objetivo

Cubrir con tests las piezas de audio en core: `audioSettingsStore`, `resolveAudioEvents` y comportamiento del `HeadlessAudioAdapter`. Mínimo 30 tests pasando.

---

## ✅ Success Criteria

- [ ] `packages/engine-core/src/__tests__/audioSettingsStore.test.ts` con ≥12 tests.
- [ ] `packages/engine-core/src/__tests__/audioRules.test.ts` con ≥15 tests.
- [ ] `packages/engine-core/src/__tests__/headlessAudioAdapter.test.ts` con ≥6 tests.
- [ ] `npm run test` pasa en `packages/engine-core`.
- [ ] Sin tests flaky.

---

## 📝 Instructions

### Step 1 — `audioSettingsStore.test.ts`

Cubrir como mínimo:

- estado inicial == `DEFAULT_AUDIO_SETTINGS`
- `setMasterMuted`/`setMusicMuted`/`setSfxMuted` actualizan campos correctos
- volúmenes se clampean a `[0, 1]` (probar `-1`, `0`, `0.5`, `1`, `2`)
- `setMuted("music", true)` afecta solo música; SFX intacto
- `getEffectiveVolume("music")` devuelve `musicVolume * masterVolume`
- `getEffectiveVolume("sfx")` devuelve `0` si `masterMuted=true`
- `getEffectiveVolume("ambient")` se rige por `sfxMuted` (no music)
- `subscribe` notifica en cada `set*`
- `unsubscribe` deja de notificar
- `hydrate({ musicVolume: 0.3 })` mantiene el resto del estado
- `reset()` vuelve a defaults
- `loadAudioSettings(storage)` devuelve `null` si la clave no existe
- `loadAudioSettings(storage)` devuelve `null` si el JSON es corrupto
- `saveAudioSettings(storage, settings)` escribe en la clave correcta
- Roundtrip save→load conserva valores

Usa un stub de storage simple:

```typescript
const fakeStorage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v); },
    _map: map,
  };
};
```

### Step 2 — `audioRules.test.ts`

Cubrir como mínimo:

- `scene:changed` con `scene.music` → emite `audio:musicRequested` con `trackUrl`
- `scene:changed` sin música, anterior no persistente → `audio:musicStopped`
- `scene:changed` sin música, anterior persistente → vacío (no para)
- `scene:changed` con misma música que la actual → emite el request (el adapter decide si reiniciar)
- `item:pickedUp` con `item.pickupSoundUrl` override → usa el override
- `item:pickedUp` sin override → usa `defaults.pickupSoundUrl`
- `item:pickedUp` sin override y sin default → emite array vacío
- `item:dropped` mismo patrón override > default > vacío
- `transition:triggered` con `transition.triggerSoundUrl` → override
- `transition:triggered` sin override → default
- `dialog:triggered` con default → emite `category: "ui"`
- Eventos no relevantes (`player:moved`, etc.) → array vacío
- `fadeMs` se propaga desde `SceneMusicConfig`
- `clickSfxEvent` con override usa el override; sin → usa default; sin nada → null
- Multiple SFX requests por evento (si lo permites) — o documentado como 0..1

### Step 3 — `headlessAudioAdapter.test.ts`

- registra todas las llamadas en orden
- `reset()` limpia el log
- `playSound` registra `def` y `opts` exactos
- `setMuted("master", true)` registra `{ target: "master", muted: true }`
- `preload(urls)` resuelve sin error
- `dispose` registra una entrada del tipo correcto

### Step 4 — Ejecutar

```bash
cd packages/engine-core
npm test
```

Confirmar:

- Todos los tests nuevos pasan.
- Los tests previos (≥184 de Phase 10) siguen verdes.

---

## 📚 References

- `packages/engine-core/src/__tests__/sceneStore.test.ts` — patrón de tests de store.
- `packages/engine-core/src/__tests__/transitionRules.test.ts` — patrón de tests de rules.
- Vitest config existente del package.
