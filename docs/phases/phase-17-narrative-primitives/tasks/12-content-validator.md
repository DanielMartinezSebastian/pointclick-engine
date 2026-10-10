# Task 17.12 — Core: validador de contenido

**Effort**: 3h | **Modelo**: sonnet | **Blocks**: 16, 17 | **Blocked by**: 06, 07, 08, 09

**Archivos permitidos**: `packages/engine-core/src/game/narrative/validateContent.ts`, `narrative/index.ts`, `game/runtime/{types,createGameRuntime}.ts`, `src/__tests__/validateContent.test.ts`.

## 🎯 Objetivo

Con el contenido como datos, los errores típicos de una aventura son referencias rotas: un guion que da un ítem que no existe, una transición a una escena sin registrar, una opción que salta a un nodo inexistente. Hoy se descubrirían jugando. Deben descubrirse al arrancar.

## API

```ts
export interface ContentIssue {
  severity: "error" | "warning";
  code: string;            // p. ej. "unknown-item", "unknown-scene", "unknown-dialogue-node"
  where: string;           // ruta legible: "scene:town > hotspot:well > verbs.use[0].do[2]"
  message: string;
}
export interface GameContent {
  scenes: GameSceneConfig[];
  items: GameItemConfig[];
  dialogues?: DialogueDefinition[];
  /** Claves de diálogo conocidas; si se pasa, se validan las claves de `say`, `label`, `line` y `text`. */
  dialogKeys?: ReadonlySet<string>;
  /** Nombres de manejadores `call` que el host registra. */
  handlers?: ReadonlySet<string>;
}
export function validateContent(content: GameContent): ContentIssue[];
// GameRuntimeConfig gana validate?: boolean | "throw"  (por defecto: true en desarrollo, avisa por consola)
```

## Qué comprueba

- **Errores**: ids duplicados (escenas, ítems, hotspots, NPCs, transiciones, diálogos, nodos); referencias a escenas, ítems, diálogos, nodos, interacciones o hotspots inexistentes, en cualquier acción o condición; `start` de un diálogo inexistente; nodo sin salida que no es final intencionado.
- **Avisos**: nodos de diálogo inalcanzables; escenas inalcanzables desde la inicial; ítems que nada da ni coloca; flags que se leen y nunca se escriben, y al revés; claves de diálogo desconocidas (si se pasó `dialogKeys`); `call` a un manejador no declarado (si se pasó `handlers`).

## 📝 Instructions

1. Un único recorrido genérico de acciones y condiciones (`walkScript`, `walkCondition`) que usen todas las comprobaciones, para que una acción nueva solo haya que enseñársela a un sitio.
2. Función pura: no lee stores ni registros globales.
3. `where` debe bastar para encontrar el dato sin depurar.
4. Tests (≥ 30): un contenido válido sin incidencias y un caso mínimo por cada código.

## ✅ Success Criteria

- [ ] Tests del core verdes; `coreAgnosticism.test.ts` verde.
- [ ] Validar el contenido actual de la demo no produce errores (los avisos se listan en el reporte).
- [ ] Ningún archivo nuevo por encima de 300 líneas.
