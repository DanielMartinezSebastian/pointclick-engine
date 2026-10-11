# Task 17.13 — Renderer: hotspots y verbos

**Effort**: 4h | **Modelo**: sonnet | **Blocks**: 16 | **Blocked by**: 06

**Archivos permitidos**: `packages/engine-renderer-r3f/src/scene/SceneHotspots.tsx`, `src/hooks/useHotspotInteractions.ts`, `src/components/VerbMenu.tsx`, `src/viewport/{useGameViewportController.ts,GameViewportView.tsx}`, `src/GameTouchSpriteRuntime.tsx` (solo leer el bloqueo de entrada), `src/index.ts`, tests nuevos en `src/__tests__/`.

## 🎯 Objetivo

Que el jugador pueda hacer click en un hotspot y actuar sobre él, y arrastrar un ítem del inventario encima.

## Comportamiento

- **Click** sobre un hotspot: ejecuta su verbo por defecto (`getDefaultVerb` del core). Si el hotspot tiene más de un verbo aplicable, aparece un menú de verbos junto al cursor.
- **Arrastrar un ítem** desde la mochila y soltarlo sobre un hotspot: `hotspot:interact` con `verb: "useItem"`. Debe convivir con las dianas de arrastre actuales (`SceneDropTargets`): si el punto de suelta cae sobre ambos, gana la diana (comportamiento de 0.5.0).
- **`hotspot:noAction`**: el viewport muestra una frase genérica configurable (`noActionDialogKey`, por defecto una clave del motor).
- **Bloqueo de entrada**: mientras `inputLocked` del core es verdadero, ni el movimiento por click, teclado o joystick ni los hotspots responden.
- **Depuración**: con `debug`, los volúmenes de los hotspots se pintan como hoy las dianas.

## API

```tsx
// Vista: se monta sola si la escena tiene hotspots.
// Props nuevas de GameViewportView / GameViewport:
//   verbMenu?: ComponentType<VerbMenuProps>    // por defecto, VerbMenu del paquete
//   noActionDialogKey?: string
export interface VerbMenuProps {
  hotspot: GameSceneHotspot;
  verbs: Verb[];
  position: { x: number; y: number };          // píxeles de pantalla
  labels: Record<Verb, string>;                // ya traducidas
  onSelect(verb: Verb): void;
  onClose(): void;
}
```

## 📝 Instructions

1. Toma como modelo `src/inventory/SceneDropTargets.tsx` (volúmenes, detección de suelta) y `src/scene/SceneTransitions.tsx`.
2. `VerbMenu` es HTML sin estilos de la demo: accesible por teclado, con `role="menu"`.
3. Extrae a funciones puras lo que se pueda probar sin React (qué verbos mostrar, resolución de conflicto diana/hotspot) y pruébalo.
4. Añade una comprobación al smoke del ejemplo mínimo solo si el ejemplo gana un hotspot (se decide en la tarea 16).

## ✅ Success Criteria

- [ ] Gate técnico verde; ningún archivo del paquete referencia la demo.
- [ ] Una escena sin hotspots se ve y se comporta exactamente como en 0.5.0: `npm run smoke` 40/40 y 5/5.
- [ ] Ningún archivo nuevo por encima de 300 líneas.
