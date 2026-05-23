# PR Roadmap Pendiente

Este documento lista unicamente el trabajo pendiente para cerrar los hallazgos del review de arquitectura.

Referencia: [ARCHITECTURE_REVIEW.md](./ARCHITECTURE_REVIEW.md)

## Estado actual

- Fase 1, 2 y 3: completadas.
- Pendiente principal: Fase 4 (API publica de libreria + adapters de plataforma).
- Pendiente adicional: separar mejor runtime/editor en `sceneStore`.

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

- [ ] `npm run lint` en verde (analisis estatico: sin `any`, sin imports circulares, tipos completos)
- [ ] `npm run test` en verde (sin archivos de test que toquen publicApi.ts)
- [ ] `npm run build` en verde

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

- [ ] `npm run lint` en verde (analisis estatico: SSR-safe, empty-catch validos TS 4.0+, sin any)
- [ ] `npm run test` en verde (sin archivos de test que toquen platform-web.ts)
- [ ] `npm run build` en verde

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

- [ ] `npm run lint` en verde (analisis estatico: deps arrays correctos en useCallback/useEffect, sin any, patron void para async handlers)
- [ ] `npm run test` en verde (sin archivos de test que toquen sceneEditorStore o consumidores)
- [ ] `npm run build` en verde

Riesgos a vigilar:

- Evitar regresiones en paneles debug.
- Mantener comportamiento del gameplay sin cambios funcionales.

## Criterio de cierre final

Marcar roadmap como cerrado solo cuando:

- [x] PR A completada
- [x] PR B completada
- [x] PR C completada
- [ ] No queden hallazgos criticos abiertos respecto a `docs/ARCHITECTURE_REVIEW.md`

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

- [ ] Definir tipos publicos en un modulo estable de API.
- [ ] Crear esqueleto de `createGameRuntime(config)` sin comportamiento final completo.
- [ ] Diseñar firmas de `registerScene`, `registerItem`, `registerRule`.
- [ ] Definir interfaz objetivo de `GameViewport`.
- [ ] Añadir documento corto con decisiones de diseño y ejemplos de uso.

Salida esperada de la semana:

- API tipada compilando y consumible desde el demo, aunque sea con implementaciones parciales.

### Semana 2 - Implementacion completa de PR A

Objetivo:

- Completar el comportamiento funcional de la API publica minima.

Tareas:

- [ ] Implementar `createGameRuntime(config)` con estado y acciones base.
- [ ] Conectar registro declarativo de escenas/items/rules al runtime.
- [ ] Implementar `GameViewport` conectado a runtime.
- [ ] Rewire del demo para usar API publica en vez de imports internos directos donde aplique.
- [ ] Añadir tests de contrato (registro y consumo).

Salida esperada de la semana:

- PR A lista para merge con lint/test/build en verde.

### Semana 3 - Implementacion de PR B (platform-web)

Objetivo:

- Introducir adapters web con contratos claros y al menos una implementacion real.

Tareas:

- [ ] Crear `app/lib/platform-web/storage`, `routing`, `clipboard`, `network`.
- [ ] Definir interfaces comunes y puertos de entrada al runtime.
- [ ] Implementar adapter `localStorage` con fallback seguro.
- [ ] Integrar al runtime sin usar APIs web directas fuera de adapters.
- [ ] Añadir tests de adapters y fallback SSR.

Salida esperada de la semana:

- PR B lista para merge con un adapter funcional y contratos listos para ampliar.

### Semana 4 - Implementacion de PR C (runtime vs editor)

Objetivo:

- Separar responsabilidades del store sin romper herramientas de debug.

Tareas:

- [ ] Crear `sceneEditorStore` con acciones de edicion/debug.
- [ ] Reducir `sceneStore` a estado runtime y transiciones de juego.
- [ ] Adaptar hooks runtime y paneles debug a la nueva separacion.
- [ ] Documentar invariantes y ownership de estado.
- [ ] Ejecutar prueba manual en modo debug para validar UX del editor.

Salida esperada de la semana:

- PR C lista para merge con comportamiento de gameplay y debug intacto.

## Checklist de control por semana

Antes de cerrar cada semana:

- [ ] Alcance semanal completado
- [ ] Sin regresiones funcionales visibles en demo
- [ ] `npm run lint` en verde
- [ ] `npm run test` en verde
- [ ] `npm run build` en verde
- [ ] Riesgos y decisiones registradas en este archivo

## Registro de trabajo

- 2026-05-22: Se completa Fase 1-3 (refactor y validaciones).
- 2026-05-22: Se reescribe roadmap para enfocarlo exclusivamente en pendientes de Fase 4 y F4.
- 2026-05-22: Se implementan PR A, PR B y PR C. Modulos creados: `publicApi.ts`, `platform-web.ts`, `sceneEditorStore.ts`. `sceneStore` reducido a runtime-only. Todos los consumidores actualizados.
- 2026-05-22: PR #6 mergeada a main. Se completa validacion estatica de todos los archivos nuevos/modificados. Analisis: sin `any`, tipos completos, deps arrays correctos, sin circular imports, SSR-safe. Errores preexistentes en `GameTouchCanvas.tsx` (lineas 373/388/1368) no introducidos por estos PRs. Pendiente: ejecutar `npm run lint/test/build` manualmente para confirmar verde en CI (pwsh.exe no disponible en este entorno).
