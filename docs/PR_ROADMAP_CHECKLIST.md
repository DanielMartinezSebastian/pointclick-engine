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

- [ ] Crear modulo publico (por ejemplo `app/lib/engine/publicApi.ts`).
- [ ] Incluir contrato para `createGameRuntime(config)`.
- [ ] Incluir registro declarativo: `registerScene`, `registerItem`, `registerRule`.
- [ ] Definir `GameViewport` como punto de integracion de canvas/runtime.
- [ ] Añadir tipos publicos reutilizables para escenas/items/rules.

Validacion:

- [ ] `npm run lint` en verde
- [ ] `npm run test` en verde
- [ ] `npm run build` en verde

Riesgos a vigilar:

- Evitar acoplar API publica a detalles de `app/demo/content/**`.
- Mantener compatibilidad con wiring actual del demo.

## PR B - Capa platform-web

Objetivo:

- Crear frontera de interoperabilidad web para evitar integraciones ad hoc.

Entregables minimos:

- [ ] Crear estructura `app/lib/platform-web/`.
- [ ] Definir interfaces para `storage`, `routing`, `clipboard` y `network`.
- [ ] Implementar al menos un adapter concreto (ejemplo: `localStorage`).
- [ ] Conectar runtime para consumir interfaces, no llamadas web directas.

Validacion:

- [ ] `npm run lint` en verde
- [ ] `npm run test` en verde
- [ ] `npm run build` en verde

Riesgos a vigilar:

- No mezclar codigo de UI con adapters de plataforma.
- Mantener fallback seguro para SSR/no-window.

## PR C - Separacion runtime vs editor store

Objetivo:

- Reducir mezcla de responsabilidades en `sceneStore`.

Entregables minimos:

- [ ] Separar estado/acciones de editor en store independiente (por ejemplo `sceneEditorStore`).
- [ ] Mantener `sceneStore` enfocado en estado runtime y transiciones de juego.
- [ ] Ajustar hooks/controladores para consumir ambos stores sin acoplamiento circular.
- [ ] Documentar invariantes de estado y ownership.

Validacion:

- [ ] `npm run lint` en verde
- [ ] `npm run test` en verde
- [ ] `npm run build` en verde

Riesgos a vigilar:

- Evitar regresiones en paneles debug.
- Mantener comportamiento del gameplay sin cambios funcionales.

## Criterio de cierre final

Marcar roadmap como cerrado solo cuando:

- [ ] PR A completada
- [ ] PR B completada
- [ ] PR C completada
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
