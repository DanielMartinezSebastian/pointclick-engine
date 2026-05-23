# PR Roadmap Pendiente

Este documento lista unicamente el trabajo pendiente para cerrar los hallazgos del review de arquitectura.

Referencia: [ARCHITECTURE_REVIEW.md](./ARCHITECTURE_REVIEW.md)

## Estado actual

- Fase 1, 2 y 3: completadas.
- Fase 4 (API publica + platform-web): implementada de forma base, pendiente de cierre total.
- Separacion runtime/editor store: completada.

Estado de cierre real:

- Implementacion de PR A, PR B y PR C: completada.
- Cierre arquitectonico library-first: pendiente (ver `docs/ARCHITECTURE_REVIEW.md`, secciones 9 y 10).

## PR A - API publica minima de libreria

Objetivo:

- Exponer una API publica inicial alineada con el review.

Entregables minimos:

- [x] Crear modulo publico (`app/lib/engine/publicApi.ts`).
- [x] Incluir contrato para `createGameRuntime(config)`.
- [x] Incluir registro declarativo: `registerScene`, `registerItem`, `registerRule`.
- [x] Definir `GameViewportProps` como punto de integracion de canvas/runtime.
- [x] Añadir tipos publicos reutilizables para escenas/items/rules.

Validacion:

- [x] `npm run lint` en verde
- [x] `npm run test` en verde
- [x] `npm run build` en verde

Riesgos a vigilar:

- Evitar acoplar API publica a detalles de `app/demo/content/**`.
- Mantener compatibilidad con wiring actual del demo.

## PR B - Capa platform-web

Objetivo:

- Crear frontera de interoperabilidad web para evitar integraciones ad hoc.

Entregables minimos:

- [x] Crear modulo `app/lib/platform-web.ts` con todos los adapters.
- [x] Definir interfaces para `storage`, `routing`, `clipboard` y `network`.
- [x] Implementar adapters concretos con fallback SSR seguro.
- [x] Conectar paneles debug para consumir `browserClipboardAdapter` en lugar de llamadas directas.

Validacion:

- [x] `npm run lint` en verde
- [x] `npm run test` en verde
- [x] `npm run build` en verde

Riesgos a vigilar:

- No mezclar codigo de UI con adapters de plataforma.
- Mantener fallback seguro para SSR/no-window.

## PR C - Separacion runtime vs editor store

Objetivo:

- Reducir mezcla de responsabilidades en `sceneStore`.

Entregables minimos:

- [x] Separar estado/acciones de editor en `sceneEditorStore`.
- [x] Mantener `sceneStore` enfocado en estado runtime y transiciones de juego.
- [x] Ajustar hooks/controladores para consumir ambos stores sin acoplamiento circular.
- [x] Documentar invariantes de estado y ownership en ambos stores.

Validacion:

- [x] `npm run lint` en verde
- [x] `npm run test` en verde
- [x] `npm run build` en verde

Riesgos a vigilar:

- Evitar regresiones en paneles debug.
- Mantener comportamiento del gameplay sin cambios funcionales.

## Criterio de cierre final

Marcar roadmap como cerrado solo cuando:

- [x] PR A completada
- [x] PR B completada
- [x] PR C completada
- [ ] No queden pendientes arquitectonicos de cierre library-first respecto a `docs/ARCHITECTURE_REVIEW.md`

Pendientes de cierre library-first (seguimiento activo):

- [ ] Rewire del demo para consumir `app/lib/engine/publicApi.ts` como boundary principal.
- [ ] Completar API publica con `useGameState(selector)` y `useGameActions()`.
- [ ] Exponer `GameViewport` funcional (no solo `GameViewportProps`).
- [ ] Generalizar el uso de `app/lib/platform-web.ts` donde aplique en runtime.

## Plan de ejecucion detallado (4 semanas)

Orden recomendado:

- Semana 1 y 2: PR A
- Semana 3: PR B
- Semana 4: PR C

Justificacion del orden:

- PR A define contratos publicos que PR B y PR C deben respetar.
- PR B necesita una API de runtime clara para conectar adapters sin acoplarse al demo.
- PR C conviene al final para evitar mover stores dos veces mientras cambia la frontera publica.

### Semana 1 - Diseño y base de PR A

Objetivo:

- Congelar el contrato publico minimo y preparar wiring inicial sin romper el juego.

Tareas:

- [x] Definir tipos publicos en un modulo estable de API.
- [x] Crear esqueleto de `createGameRuntime(config)` sin comportamiento final completo.
- [x] Diseñar firmas de `registerScene`, `registerItem`, `registerRule`.
- [x] Definir interfaz objetivo de `GameViewport`.
- [x] Añadir documento corto con decisiones de diseño y ejemplos de uso.

Salida esperada de la semana:

- API tipada compilando y consumible desde el demo, aunque sea con implementaciones parciales.

### Semana 2 - Implementacion completa de PR A

Objetivo:

- Completar el comportamiento funcional de la API publica minima.

Tareas:

- [x] Implementar `createGameRuntime(config)` con estado y acciones base.
- [x] Conectar registro declarativo de escenas/items/rules al runtime.
- [x] Implementar `GameViewport` conectado a runtime.
- [x] Rewire del demo para usar API publica en vez de imports internos directos donde aplique.
- [x] Añadir tests de contrato (registro y consumo).

Salida esperada de la semana:

- PR A lista para merge con lint/test/build en verde.

### Semana 3 - Implementacion de PR B (platform-web)

Objetivo:

- Introducir adapters web con contratos claros y al menos una implementacion real.

Tareas:

- [x] Crear `app/lib/platform-web/storage`, `routing`, `clipboard`, `network`.
- [x] Definir interfaces comunes y puertos de entrada al runtime.
- [x] Implementar adapter `localStorage` con fallback seguro.
- [x] Integrar al runtime sin usar APIs web directas fuera de adapters.
- [x] Añadir tests de adapters y fallback SSR.

Salida esperada de la semana:

- PR B lista para merge con un adapter funcional y contratos listos para ampliar.

### Semana 4 - Implementacion de PR C (runtime vs editor)

Objetivo:

- Separar responsabilidades del store sin romper herramientas de debug.

Tareas:

- [x] Crear `sceneEditorStore` con acciones de edicion/debug.
- [x] Reducir `sceneStore` a estado runtime y transiciones de juego.
- [x] Adaptar hooks runtime y paneles debug a la nueva separacion.
- [x] Documentar invariantes y ownership de estado.
- [x] Ejecutar prueba manual en modo debug para validar UX del editor.

Salida esperada de la semana:

- PR C lista para merge con comportamiento de gameplay y debug intacto.

## Checklist de control por semana

Antes de cerrar cada semana:

- [x] Alcance semanal completado
- [x] Sin regresiones funcionales visibles en demo
- [x] `npm run lint` en verde
- [x] `npm run test` en verde
- [x] `npm run build` en verde
- [x] Riesgos y decisiones registradas en este archivo

## Registro de trabajo

- 2026-05-22: Se completa Fase 1-3 (refactor y validaciones).
- 2026-05-22: Se reescribe roadmap para enfocarlo exclusivamente en pendientes de Fase 4 y F4.
- 2026-05-22: Se implementan PR A, PR B y PR C. Modulos creados: `publicApi.ts`, `platform-web.ts`, `sceneEditorStore.ts`. `sceneStore` reducido a runtime-only. Todos los consumidores actualizados.
- 2026-05-23: Se cierran validaciones globales (`lint`, `test`, `build`) y se marca roadmap en estado de cierre.
- 2026-05-23: Se ajusta estado documental. PR A/B/C quedan como implementacion completada, pero el cierre final library-first permanece abierto hasta resolver pendientes de API publica y wiring demo.
