# Task 17.19 — Gate de validación y 0.6.0

**Effort**: 2h | **Modelo**: opus (orquestador) | **Blocks**: Fase 18 | **Blocked by**: todas

## 🎯 Objetivo

Validar la fase completa y dejar 0.6.0 lista para publicar. Publicar en npm y hacer push no forman parte de esta tarea: requieren orden explícita del owner.

## 📝 Instructions

### 1. Gate técnico (con `dist/` borrado antes)

```bash
npm run build:packages && npm test && npm run typecheck && npm run lint && npm run build
```

### 2. Compatibilidad con 0.5.0

- Lista de exports de `publicApi.ts` y de los dos `index.ts` de los paquetes: ninguno perdido respecto a la etiqueta o commit de 0.5.0.
- `GameCommand` y `GameEvent`: todas las variantes de 0.5.0 siguen existiendo con la misma forma.
- `/example-minimal` tal como estaba en 0.5.0 (recuperado de git a un archivo temporal) compila y funciona contra 0.6.0.

### 3. Fronteras

```bash
grep -rln "demo-content\|apps/web-demo" packages/*/src     # vacío
```

`coreAgnosticism.test.ts` verde.

### 4. Narrativa

- El recorrido headless de la mini-aventura (tarea 17) pasa.
- `validateContent` sobre el contenido de la demo: 0 errores.
- `grep -rn "canLeaveScene\|onSceneEnter\|getInitialPlacedItems" apps/web-demo/app` vacío.

### 5. Smoke y consumo real

- `npm run smoke` completo, con las comprobaciones narrativas.
- `npm pack` de ambos paquetes, instalación en un proyecto Next.js vacío fuera del monorepo con una copia de `/example-minimal`, build y smoke del ejemplo. En la Fase 16 esta prueba encontró dos fallos que ningún test veía.

### 6. Partidas guardadas

Una partida real de 0.5.0 (las cuatro claves, generadas con el smoke de 0.5.0 o escritas a mano en el formato exacto) carga en 0.6.0 con escena, inventario, ítems colocados y puertas intactos.

### 7. Release

- Versión `0.6.0` en ambos `package.json`, en las constantes `VERSION` y `RENDERER_VERSION`, y en el rango de la dependencia del renderer sobre el core.
- CHANGELOG revisado. Estado de la fase `completed`. `docs/README.md` y `CLAUDE.md` actualizados.
- Retrospectiva en el README de la fase: qué quedó fuera y qué primitivas echó en falta el contenido de prueba (entrada directa para la Fase 18).

## ✅ Success Criteria

- [ ] Pasos 1–6 sin fallos, con la evidencia anotada en `tracking.md`.
- [ ] Ningún check marcado sin haber ejecutado su comprobación.
