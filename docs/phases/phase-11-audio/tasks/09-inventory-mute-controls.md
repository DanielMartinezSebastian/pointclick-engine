# Task 11.9 — UI: mute controls en InventoryUI

**Effort**: 1h | **Blocks**: [11.10] | **Blocked by**: [11.3, 11.4]

---

## 🎯 Objetivo

Añadir tres toggles en `apps/web-demo/app/components/InventoryUI.tsx` (encima del botón "Reiniciar"): **Sonido (master)**, **Música**, **Efectos**. Leen del `audioSettingsStore` (vía hook expuesto por la app) y despachan `audio:setMuted`.

---

## ✅ Success Criteria

- [ ] Tres botones-toggle con estado visible (icon 🔊/🔇 + texto).
- [ ] Distribución vertical compacta, sin romper el layout existente.
- [ ] Estado sincronizado bidireccional: el store cambia → UI refleja; click en UI → store cambia.
- [ ] Master mute deshabilita visualmente (opacidad/cursor) los otros dos toggles (siguen clickables pero greyed out).
- [ ] Funcionan en mobile y desktop (mismo padding/spacing del resto del panel).
- [ ] No introduce React state duplicado del store (sólo selector + setter).
- [ ] Persistencia funciona: refrescar la página mantiene el estado de mute.
- [ ] Tests opcionales: smoke con React Testing Library verificando que el click invoca el setter del store.

---

## 📝 Instructions

### Step 1 — Hook puente

Asumimos que `apps/web-demo/app/store/` o similar ya tiene el `audioSettingsStore` instanciado. Si no existe:

```typescript
// apps/web-demo/app/store/audio.ts
import { createAudioSettingsStore } from "@pointclick-engine/engine-core";
import { useSyncExternalStore } from "react";
import { bindAudioPersistence } from "../lib/platform-web";

export const audioSettingsStore = createAudioSettingsStore();
bindAudioPersistence(audioSettingsStore);

export function useAudioSettings() {
  return useSyncExternalStore(
    audioSettingsStore.subscribe,
    audioSettingsStore.getState,
    audioSettingsStore.getState,
  );
}
```

### Step 2 — Integrar en `InventoryUI.tsx`

Importar:

```typescript
import { useAudioSettings, audioSettingsStore } from "../store/audio";
```

Dentro del panel, entre el `<strong>Inventario</strong>` y el botón "Reiniciar", añadir un bloque:

```tsx
const audio = useAudioSettings();

<div style={{ display: "grid", gap: "6px", marginTop: "10px" }}>
  <MuteToggle
    icon={audio.masterMuted ? "🔇" : "🔊"}
    label={audio.masterMuted ? "Sonido off" : "Sonido"}
    pressed={audio.masterMuted}
    onClick={() => audioSettingsStore.setMasterMuted(!audio.masterMuted)}
  />
  <MuteToggle
    icon={audio.musicMuted ? "🔇" : "🎵"}
    label={audio.musicMuted ? "Música off" : "Música"}
    pressed={audio.musicMuted}
    disabled={audio.masterMuted}
    onClick={() => audioSettingsStore.setMusicMuted(!audio.musicMuted)}
  />
  <MuteToggle
    icon={audio.sfxMuted ? "🔇" : "🔔"}
    label={audio.sfxMuted ? "Efectos off" : "Efectos"}
    pressed={audio.sfxMuted}
    disabled={audio.masterMuted}
    onClick={() => audioSettingsStore.setSfxMuted(!audio.sfxMuted)}
  />
</div>
```

### Step 3 — Componente `MuteToggle`

Crear `apps/web-demo/app/components/MuteToggle.tsx`:

```tsx
"use client";

type Props = {
  icon: string;
  label: string;
  pressed: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function MuteToggle({ icon, label, pressed, disabled, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "8px 12px",
        fontSize: "12px",
        fontWeight: "bold",
        color: pressed ? "#a8c8d8" : "#bff4ff",
        backgroundColor: pressed ? "rgb(40 60 80 / 100%)" : "rgb(26 82 112 / 100%)",
        border: "2px solid rgb(132 230 255 / 78%)",
        borderRadius: "4px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        textShadow: "0 2px 0 rgb(0 0 0 / 35%)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "inset 0 0 0 2px rgb(255 255 255 / 8%)",
      }}
    >
      <span style={{ fontSize: "16px" }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
```

### Step 4 — Validación manual

1. Lanzar `npm run dev` en `apps/web-demo`.
2. Abrir inventario, ver los tres toggles.
3. Click en "Sonido" → cualquier SFX siguiente está silenciado.
4. Click en "Música" → para la música; click otra vez → vuelve.
5. Refrescar página: el estado de mute persiste.

### Step 5 — Test smoke (opcional pero recomendado)

`InventoryUI.test.tsx`:

```typescript
it("toggles master mute on click", async () => {
  render(<InventoryUI isOpen={true} slots={[]} onToggle={() => {}} onStartDrag={() => {}} />);
  const btn = screen.getByRole("button", { name: /sonido/i });
  expect(audioSettingsStore.getState().masterMuted).toBe(false);
  await user.click(btn);
  expect(audioSettingsStore.getState().masterMuted).toBe(true);
});
```

---

## 📚 References

- `apps/web-demo/app/components/InventoryUI.tsx` — componente a modificar.
- Task 11.3 — `audioSettingsStore` API.
- Task 11.7 — `bindAudioPersistence` para localStorage.
