# Task 17.06 — Core: hotspots con verbos

**Effort**: 4h | **Modelo**: sonnet | **Blocks**: 12, 13, 14, 17 | **Blocked by**: 05

**Archivos permitidos**: `packages/engine-core/src/game/types/index.ts` (solo añadir), `game/narrative/hotspots.ts`, `narrative/index.ts`, `game/commands/types.ts`, `game/events/types.ts`, `game/runtime/{types,registry,executors}.ts`, `src/__tests__/hotspots.test.ts`.

## 🎯 Objetivo

Que una escena tenga cosas que se pueden mirar, usar y con las que hablar, y que un ítem del inventario se pueda usar sobre ellas.

## API

```ts
export type Verb = "look" | "use" | "talk";

export interface GameSceneHotspot {
  id: string;
  label: string;                             // clave de i18n
  position: GameVec3;
  halfSize: GameVec3;
  rotationY?: number;
  visibleWhen?: Condition;
  hasCollision?: boolean;
  /** Punto al que camina el jugador antes de actuar. Sin él, actúa desde donde está. */
  approach?: GameVec3;
  verbs?: Partial<Record<Verb, Branch[]>>;
  useItem?: Record<string, Branch[]>;        // por itemId
  useItemDefault?: Branch[];                 // ítem sin regla propia
}
// GameScene y GameSceneConfig ganan: hotspots?: GameSceneHotspot[]

// Comando: { type: "hotspot:interact"; hotspotId: string; verb: Verb | "useItem"; itemId?: string }
// Eventos: hotspot:interacted, hotspot:noAction

/** Entre los verbos con una rama aplicable: talk, luego use, luego look. */
export function getDefaultVerb(hotspot: GameSceneHotspot, ctx: ConditionContext): Verb | null;
```

## 📝 Instructions

1. El executor resuelve la rama con `pickBranch`, camina a `approach` si existe y ejecuta el guion con el secuenciador. Sin rama aplicable emite `hotspot:noAction`; el host decide qué decir.
2. `toRuntimeScene` debe conservar `hotspots`.
3. Con esto `inventory:pickup` e `inventory:drop` dejan de ser avisos: impleméntalos sobre los stores del core y las reglas de inventario existentes (recoger un ítem colocado por id; soltar un slot sobre una interacción o un hotspot). Añade a esos comandos los campos opcionales que falten sin romper los actuales.
4. Tests (≥ 25): cada verbo, `visibleWhen`, `useItem` con y sin regla, `approach`, verbo por defecto, `noAction`, y los dos comandos de inventario.

## ✅ Success Criteria

- [ ] Tests del core verdes; `coreAgnosticism.test.ts` verde.
- [ ] `grep -n "deferred" packages/engine-core/src/game/runtime/executors.ts` vacío.
- [ ] Una escena sin `hotspots` se comporta exactamente como en 0.5.0.
