# PR Roadmap Checklist

Este documento sirve para verificar, en cualquier momento, si la ruta de PRs de arquitectura se completó correctamente.

## Estado general

- [x] PR 1 completada: separar engine de UI
- [x] PR 2 completada: mover contenido demo a modulo demo
- [x] PR 3 completada: cerrar calidad de runtime (tests/eventos)

## Convenciones de seguimiento

- Estado por PR: `Pendiente` | `En progreso` | `Completada`
- Cada PR debe incluir:
  - Enlace al PR
  - Commit(s) principales
  - Evidencia de validacion (`npm run lint`, `npm run test`, `npm run build`)
  - Riesgos o deuda remanente

---

## PR 1 - Separar engine de UI

**Objetivo**
- Eliminar acoplamiento directo `engine -> components`.
- Dejar en engine solo runtime/controller/contratos/tipos.

**Estado**
- Estado: `Completada`
- PR: 
- Branch: `main`
- Fecha de cierre: 2026-05-22

**Checklist tecnico**
- [x] No hay imports desde `app/lib/engine/**` hacia `app/components/**`.
- [ ] Los contratos/tipos compartidos viven en `app/lib/engine/types/**`.
- [x] `GameTouchCanvas` actua como shell de composicion.
- [x] Se mantiene comportamiento funcional sin regresiones visibles.

**Validacion**
- [x] `npm run lint` en verde
- [x] `npm run test` en verde
- [x] `npm run build` en verde

**Evidencias**
- Archivos clave tocados:
  - `app/lib/engine/runtime/GameTouchSpriteRuntime.tsx`
  - `app/lib/engine/runtime/useInventoryRuntimeController.ts`
  - `app/lib/engine/render/**`
  - `app/components/scene/**` (re-exports de compatibilidad)
  - `app/components/sprite/**` (re-exports de compatibilidad)
  - `app/components/SpeechBubble.tsx` (re-export de compatibilidad)
- Notas:
  - Se movio la capa visual usada por runtime a `app/lib/engine/render/**`.
  - Se mantuvieron wrappers en `app/components/**` para evitar roturas de imports existentes.

---

## PR 2 - Mover contenido demo a modulo demo

**Objetivo**
- Separar contenido demo (escenas/items/dialogos/wiring demo) del core reusable.
- Dejar una frontera clara entre `demo` y `lib`.

**Estado**
- Estado: `Completada`
- PR: 
- Branch: `main`
- Fecha de cierre: 2026-05-22

**Checklist tecnico**
- [x] Existe area de demo dedicada (por ejemplo `app/demo/content/**`).
- [x] Escenas/items/dialogos demo no quedan mezclados en core.
- [x] Engine consume contratos normalizados, no contenido hardcodeado de app.
- [x] Imports y wiring actualizados sin romper flujo de juego.

**Validacion**
- [x] `npm run lint` en verde
- [x] `npm run test` en verde
- [x] `npm run build` en verde

**Evidencias**
- Archivos clave tocados:
  - `app/demo/content/scenes.ts`
  - `app/demo/content/items/index.ts`
  - `app/demo/content/dialogs/index.ts`
  - `app/demo/content/dialogs/getRandomPhrase.ts`
  - `app/scenes/scenes.ts` (re-export de compatibilidad)
  - `app/items/index.ts` (re-export de compatibilidad)
  - `app/dialogs/index.ts` (re-export de compatibilidad)
  - `app/dialogs/getRandomPhrase.ts` (re-export de compatibilidad)
  - `app/store/sceneStore.ts`
  - `app/lib/engine/runtime/useSceneRuntimeController.ts`
  - `app/lib/engine/runtime/useInventoryRuntimeController.ts`
  - `app/lib/engine/runtime/GameTouchSpriteRuntime.tsx`
- Notas:
  - Se movio el contenido demo a `app/demo/content/**` y se mantuvieron rutas legacy como puentes.
  - Se actualizaron consumidores de runtime/store para depender de la nueva ubicacion demo.

---

## PR 3 - Cerrar calidad de runtime

**Objetivo**
- Subir cobertura de calidad en runtime: testabilidad y observabilidad.
- Agregar pruebas deterministas y eventos runtime basicos.

**Estado**
- Estado: `Completada`
- PR: 
- Branch: `main`
- Fecha de cierre: 2026-05-22

**Checklist tecnico**
- [x] Hay tests deterministas para movimiento/pathfinding.
- [x] Se cubren escenarios clave de interaccion (`drop`, `pickup`, colisiones relevantes).
- [x] Runtime expone/centraliza eventos base (`onMove`, `onCollide`, `onDrop`, `onDialog`) o equivalente definido.
- [x] Se documentan limites y riesgos residuales.

**Validacion**
- [x] `npm run lint` en verde
- [x] `npm run test` en verde
- [x] `npm run build` en verde

**Evidencias**
- Archivos clave tocados:
  - `app/lib/engine/types/runtimeEvents.ts`
  - `app/lib/engine/runtime/GameTouchSpriteRuntime.tsx`
  - `app/lib/engine/runtime/useInventoryRuntimeController.ts`
  - `app/components/GameTouchCanvas.tsx`
  - `app/lib/engine/movement/findPath.test.ts`
- Notas:
  - Se añadieron eventos runtime tipados y callback central en canvas para observabilidad en debug.
  - Se añadieron tests deterministas de `findPath` (ruta directa, desvio por obstaculo y caso sin solucion).
  - Riesgo residual: `onCollide` actual refleja colision logica (`boundary`/`stuck`) y no eventos físicos de Rapier por contacto específico.

---

## Criterio de cierre de la ruta

Marcar la ruta como completada solo cuando:

- [x] Las 3 PRs esten en estado `Completada`.
- [x] Todas las validaciones de cada PR esten en verde.
- [ ] No queden hallazgos criticos abiertos respecto a `docs/ARCHITECTURE_REVIEW.md`.

## Registro rapido de avances

- 2026-05-22: Se crea este checklist de control de ruta.
- 2026-05-22: PR 1 completada. Engine deja de importar `app/components/**`; validado con lint, test y build.
- 2026-05-22: PR 2 completada. Contenido demo (escenas/items/dialogos) movido a `app/demo/content/**`; validado con lint, test y build.
- 2026-05-22: PR 3 completada. Se incorporan eventos runtime y tests de pathfinding; validado con lint, test y build.
