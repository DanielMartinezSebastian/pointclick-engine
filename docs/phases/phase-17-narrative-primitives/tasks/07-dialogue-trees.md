# Task 17.07 — Core: árboles de diálogo

**Effort**: 4h | **Modelo**: sonnet | **Blocks**: 12, 14, 15, 17 | **Blocked by**: 05

**Archivos permitidos**: `packages/engine-core/src/game/narrative/dialogue.ts`, `narrative/index.ts`, `game/state/dialogueStore.ts`, `state/index.ts`, `game/commands/types.ts`, `game/events/types.ts`, `game/runtime/{types,registry,executors}.ts`, `src/__tests__/dialogueTrees.test.ts`.

## 🎯 Objetivo

Conversaciones con varios turnos y opciones que dependen del estado y lo modifican. Hoy un "diálogo" es una frase suelta.

## API

```ts
export interface DialogueNode {
  id: string;
  speaker?: string;            // id de NPC o "player"
  line?: string;               // clave de i18n; sin línea, el nodo solo ejecuta `do`
  do?: Script;                 // efectos al entrar en el nodo
  choices?: DialogueChoice[];  // sin opciones, avanza a `next`
  next?: string;               // id de nodo; sin next ni choices, el diálogo termina
}
export interface DialogueChoice {
  text: string;                // clave de i18n
  when?: Condition;            // opción oculta si no se cumple
  once?: boolean;              // desaparece tras elegirla (se recuerda con un flag interno)
  do?: Script;
  next?: string;
}
export interface DialogueDefinition { id: string; start: string; nodes: DialogueNode[] }

// GameRuntimeConfig gana dialogues?: DialogueDefinition[]; registerDialogue(def)
// Store: useDialogueStore { activeDialogueId, node, choices (ya filtradas), start, choose, advance, end }
// Comandos: dialogue:start, dialogue:choose, dialogue:advance, dialogue:end
// Eventos: dialogue:started, dialogue:nodeEntered, dialogue:choiceMade, dialogue:ended
```

## 📝 Instructions

1. Distingue los nombres: `dialogStore` (bocadillo de una frase, existente) y `dialogueStore` (conversación, nuevo). La línea de un nodo se muestra por el camino existente del bocadillo, con `speaker`.
2. `once` se recuerda con un flag reservado `dlg.<dialogueId>.<nodeId>.<índice>` en el estado de mundo, para que se guarde con la partida.
3. La acción `startDialogue` del secuenciador (tarea 05) espera a `dialogue:ended`.
4. Un nodo cuyas opciones quedan todas ocultas se trata como nodo sin opciones.
5. Tests (≥ 25): lineal, ramificado, opciones condicionadas, `once`, efectos de nodo y de opción, fin por falta de `next`, `end` forzado, diálogo dentro de un guion, referencia a nodo inexistente (aviso y fin).

## ✅ Success Criteria

- [ ] Tests del core verdes sin temporizadores reales; `coreAgnosticism.test.ts` verde.
- [ ] El bocadillo de una frase existente (`dialog:trigger`) no cambia de comportamiento.
