# Task 17.14 — NPCs (core + renderer)

**Effort**: 4h | **Modelo**: sonnet | **Blocks**: 16 | **Blocked by**: 06, 07

**Archivos permitidos**: core — `packages/engine-core/src/game/types/index.ts` (solo añadir), `game/runtime/{types,registry}.ts`, `game/narrative/npcs.ts`, `narrative/index.ts`, `src/__tests__/npcs.test.ts`; renderer — `src/scene/SceneNpcs.tsx`, `src/sprite/NpcSprite.tsx`, `src/viewport/{useGameViewportController.ts,GameViewportView.tsx}`, `src/index.ts`, tests nuevos.

## 🎯 Objetivo

Personajes en la escena con los que se puede hablar.

## API

```ts
export interface GameSceneNpc {
  id: string;
  name: string;                    // clave de i18n
  /** Id de un personaje registrado en el viewport (prop `characters`). */
  characterId: string;
  position: GameVec3;
  facing?: "north" | "south" | "west" | "east";
  visibleWhen?: Condition;
  hasCollision?: boolean;
  approach?: GameVec3;
  /** Atajo: hablar inicia este diálogo. Equivale a verbs.talk = [{ do: [{ startDialogue }] }]. */
  dialogueId?: string;
  /** Verbos e ítems, igual que un hotspot. */
  verbs?: Partial<Record<Verb, Branch[]>>;
  useItem?: Record<string, Branch[]>;
}
// GameScene y GameSceneConfig ganan: npcs?: GameSceneNpc[]
// GameViewport gana: characters?: Record<string, CharacterDefinition>

/** Proyecta un NPC a hotspot para reutilizar toda la interacción de la tarea 06. */
export function npcToHotspot(npc: GameSceneNpc): GameSceneHotspot;
```

## 📝 Instructions

1. Un NPC **es** un hotspot con sprite: el core lo proyecta con `npcToHotspot` y `hotspot:interact` funciona con su id. No dupliques la lógica de verbos.
2. `NpcSprite` reutiliza `CharacterSprite` y los helpers de `sprite/character.ts`: clip `idle` orientado según `facing`, y el clip `speaking` mientras el bocadillo activo tenga `speaker` igual a su id.
3. El bocadillo se coloca sobre quien habla: hoy siempre va sobre el jugador. Lee cómo `GameTouchSpriteRuntime.tsx` posiciona `SpeechBubble` y haz que, con `speaker` de un NPC, se ancle a la posición de ese NPC. Sin `speaker` o con `"player"`, igual que hoy.
4. Escala por profundidad: usa la misma función que el jugador, para que un NPC a la misma distancia tenga el mismo tamaño.
5. Un `characterId` sin registrar: aviso por consola y volumen visible solo en `debug`; no rompe la escena.
6. Tests: `npcToHotspot` (con y sin `dialogueId`, con verbos propios), selección de clip, y visibilidad condicionada.

## ✅ Success Criteria

- [ ] Gate técnico verde; `coreAgnosticism.test.ts` verde; ningún archivo del paquete referencia la demo.
- [ ] Una escena sin NPCs se ve y se comporta exactamente como en 0.5.0: `npm run smoke` 40/40 y 5/5.
