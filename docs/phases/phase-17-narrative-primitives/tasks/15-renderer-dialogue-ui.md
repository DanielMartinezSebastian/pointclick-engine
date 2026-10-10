# Task 17.15 — Renderer: UI de diálogo con opciones

**Effort**: 3h | **Modelo**: sonnet | **Blocks**: 16 | **Blocked by**: 07

**Archivos permitidos**: `packages/engine-renderer-r3f/src/components/DialogueChoices.tsx`, `src/hooks/useDialogue.ts`, `src/viewport/{useGameViewportController.ts,GameViewportView.tsx}`, `src/index.ts`, tests nuevos en `src/__tests__/`.

## 🎯 Objetivo

Mostrar las opciones de una conversación y dejar elegir. La línea de cada nodo ya se muestra con el bocadillo existente; lo que falta es la lista de opciones y el avance.

## Comportamiento

- Mientras hay un diálogo activo, la entrada del juego está bloqueada (lo gestiona el core).
- **Nodo sin opciones**: al cerrarse el bocadillo (solo o con un click) se avanza con `dialogue:advance`.
- **Nodo con opciones**: cuando termina de escribirse la línea aparece la lista. Elegir despacha `dialogue:choose`.
- Las opciones llegan ya filtradas y traducibles desde `useDialogueStore`.

## API

```tsx
export function useDialogue(): {
  active: boolean;
  speaker?: string;
  choices: Array<{ index: number; text: string }>;   // texto ya traducido
  choose(index: number): void;
  advance(): void;
  end(): void;
};
export interface DialogueChoicesProps {
  choices: Array<{ index: number; text: string }>;
  onChoose(index: number): void;
}
/** Lista accesible sin estilos de la demo: navegable con flechas, Enter y números 1–9. */
export function DialogueChoices(props: DialogueChoicesProps): JSX.Element | null;
// GameViewport / GameViewportView ganan: dialogueChoices?: ComponentType<DialogueChoicesProps>
```

## 📝 Instructions

1. Lee `src/SpeechBubble.tsx` para saber cuándo termina de escribirse una línea y cuándo se descarta, y `src/components/LocaleSwitcher.tsx` como modelo de componente del paquete con render sustituible.
2. El bocadillo se cierra solo tras un tiempo de lectura. En un nodo con opciones no debe cerrarse solo: la línea permanece hasta que se elige. Si eso exige una prop nueva en `SpeechBubble`, que sea opcional y con el comportamiento actual por defecto.
3. `DialogueChoices` es HTML superpuesto, con `role="listbox"` y foco gestionado.
4. Extrae a funciones puras la navegación por teclado y pruébala.

## ✅ Success Criteria

- [ ] Gate técnico verde; ningún archivo del paquete referencia la demo.
- [ ] Sin diálogos activos, nada cambia respecto a 0.5.0: `npm run smoke` 40/40 y 5/5.
- [ ] Ningún archivo nuevo por encima de 250 líneas.
