# Fase 2: Tracking de Progreso

**Estado General**: Sem 2.5 - Preparación para comenzar  
**Última actualización**: 2026-05-23  
**Owner**: Daniel Martínez Sebastián

---

## 📊 Resumen de Progreso

```
Completado:    [████░░░░░░░░░░░░] 0/80 tareas (0%)
En progreso:   0 tareas
Bloqueado:     0 tareas
```

---

## 🎯 Semana 2.5: Auditoría Pre-Extracción (2-3 días)

Validar agnósticidad del core antes de mover nada.

### Auditoría de Contaminación React

- [ ] Ejecutar búsqueda: `grep -r "import.*react" app/lib/core/`
  - **Checklist**: Si está limpio (0 resultados)
  - **Si tiene problemas**: Documentar en `docs/AUDIT_FINDINGS.md`
  
- [ ] Ejecutar búsqueda: `grep -r "import.*@react-three" app/lib/core/ app/store/`
  - **Checklist**: Si está limpio
  
- [ ] Ejecutar búsqueda: `grep -r "useFrame\|useState\|useEffect" app/lib/core/ app/store/`
  - **Checklist**: Si está limpio

- [ ] Ejecutar búsqueda: `grep -r "import.*next" app/lib/core/ app/store/`
  - **Checklist**: Si está limpio

**Resultado Esperado**: 4 búsquedas limpias → core agnóstico verificado ✅

---

### Documentación de Hallazgos

- [ ] Crear `docs/AUDIT_FINDINGS.md` (vacío si todo limpio)
  
- [ ] Crear `docs/PHASE_2_FILE_MAPPING.md`
  - [ ] Listar archivos a mover (pathfinding, rules, sceneStore, etc.)
  - [ ] Para cada archivo: citar dependencias internas
  - [ ] Para cada archivo: marcar como "agnóstico ✅" o "contaminado ⚠️"

- [ ] Validar que archivos están listos para mover
  - [ ] `app/lib/core/rules/*` → agnóstico ✅
  - [ ] `app/lib/engine/movement/findPath.ts` → agnóstico ✅
  - [ ] `app/store/sceneStore.ts` → agnóstico ✅

**Resultado Esperado**: Documentación clara de qué mover y en qué orden

---

## 🔧 Semana 3: Setup Monorepo + Crear Base Estructural (5 días)

### Día 1: Crear Estructura de Directorios

- [ ] Crear `packages/engine-core/` con subdirs:
  ```bash
  mkdir -p packages/engine-core/{src/game/{state,logic,types,events,commands},dist,__tests__}
  ```
  
- [ ] Crear `packages/engine-types/` (placeholder para futuro):
  ```bash
  mkdir -p packages/engine-types/{src,dist}
  ```
  
- [ ] Crear `apps/web-demo/` (para futura migración):
  ```bash
  mkdir -p apps/web-demo
  ```

- [ ] Verificar estructura:
  ```bash
  tree -L 3 packages/ apps/
  ```

**Resultado Esperado**: Directorio structure en lugar, lista para código

---

### Día 2: Crear Archivos Base en engine-core

#### package.json base

- [ ] Copiar/crear `packages/engine-core/package.json`
  - [ ] name: `@pointclick-engine/engine-core`
  - [ ] main: `dist/index.js`
  - [ ] scripts: build, test, dev
  - [ ] dependencies: zustand ^5.0.13
  - [ ] devDependencies: typescript, vitest, @types/node

#### tsconfig.json base

- [ ] Copiar/crear `packages/engine-core/tsconfig.json`
  - [ ] target: ES2020
  - [ ] declaration: true
  - [ ] strict: true
  - [ ] outDir: ./dist
  - [ ] rootDir: ./src

#### Archivo tipos base

- [ ] Crear `packages/engine-core/src/game/types/index.ts`
  - [ ] GameVec3, GameVec2 types
  - [ ] GameSceneGround, GameSceneWall, GameSceneConfig
  - [ ] GameItemConfig, GameItemRule
  - [ ] GameState, GameActions interfaces

#### EventBus agnóstico

- [ ] Crear `packages/engine-core/src/events/EventBus.ts`
  - [ ] Clase EventBus con .on(), .emit(), .clear()
  - [ ] Type-safe con generics
  - [ ] Sin dependencias externas

#### Barrel export

- [ ] Crear `packages/engine-core/src/index.ts`
  - [ ] Exportar types públicos
  - [ ] Exportar EventBus
  - [ ] Comentario: "// TODO: state/game exports after migration"

**Resultado Esperado**: Archivos base compilables

---

### Día 3: Configurar Workspace Root

- [ ] Actualizar root `package.json`:
  - [ ] Agregar `"workspaces": ["packages/*", "apps/*"]`
  - [ ] Agregar scripts: `build`, `test`, `dev:demo`, `clean`

- [ ] Verificar workspaces:
  ```bash
  npm install
  npm run build
  # Debe compilar packages/engine-core sin errores
  ```

- [ ] Validar estructura final:
  ```bash
  ls packages/engine-core/dist/
  # Debe tener: index.js, index.d.ts, etc.
  ```

**Resultado Esperado**: Monorepo funcional, primer build exitoso ✅

---

### Día 4: Tests Iniciales de Base

- [ ] Verificar types compilan:
  ```bash
  npm run build -w packages/engine-core
  ```
  - [ ] Sin errores TypeScript

- [ ] Crear test básico para EventBus:
  ```bash
  packages/engine-core/src/events/EventBus.test.ts
  ```
  - [ ] Test: EventBus.on() registra listener
  - [ ] Test: EventBus.emit() dispara eventos
  - [ ] Test: unsubscribe funciona
  
- [ ] Ejecutar tests:
  ```bash
  npm run test -w packages/engine-core
  ```
  - [ ] Todos pasan ✅

**Resultado Esperado**: Framework de testing listo

---

### Día 5: Documentación y Validación

- [ ] Actualizar `CLAUDE.md`:
  - [ ] Sección de estructura: mencionar nuevo monorepo
  - [ ] Sección de paths: actualizar rutas de packages/

- [ ] Actualizar README.md:
  - [ ] Agregar sección "Monorepo Structure"
  - [ ] Instrucciones de build multi-workspace

- [ ] Crear `docs/MONOREPO_SETUP.md`:
  - [ ] Cómo agregar nuevo package
  - [ ] Cómo actualizar dependencias entre packages
  - [ ] Troubleshooting common issues

- [ ] Commit semana 3:
  ```
  feat(phase-2): setup monorepo + engine-core base structure
  
  - [x] Marked: packages/engine-core directory structure
  - [x] Marked: package.json and tsconfig.json base
  - [x] Marked: types, EventBus, index.ts created
  - [x] Marked: root workspace configured
  - [x] Marked: first build successful
  
  See docs/PHASE_2_QUICK_START.md (Semana 3 complete)
  ```

**Resultado Esperado**: Monorepo setup completo y documentado ✅

---

## 📦 Semana 4: Sprint 1 - Extracción de Pathfinding (5 días)

### Día 1: Análisis y Preparación

- [ ] Auditar `app/lib/engine/movement/findPath.ts`:
  - [ ] Listar todas las dependencias (import statements)
  - [ ] Verificar que NO importa React/R3F/Next.js
  - [ ] Documentar en `docs/PHASE_2_FILE_MAPPING.md`

- [ ] Auditar tests:
  - [ ] ¿Existe `findPath.test.ts`?
  - [ ] ¿Depende de React/mocks?
  - [ ] ¿Puede correr como test puro?

**Resultado Esperado**: Archivo analizado, listo para mover

---

### Día 2-3: Copiar y Adaptar

- [ ] Copiar archivo:
  ```bash
  cp app/lib/engine/movement/findPath.ts packages/engine-core/src/game/logic/pathfinding/findPath.ts
  ```

- [ ] Copiar tests:
  ```bash
  cp app/lib/engine/movement/findPath.test.ts packages/engine-core/src/game/logic/pathfinding/findPath.test.ts
  ```

- [ ] Actualizar imports en archivo copiado:
  - [ ] `@/app/lib/engine/types/...` → `../../types`
  - [ ] Verificar que NO hay imports rotos

- [ ] Crear barrel export:
  ```bash
  echo 'export { findPath } from "./pathfinding/findPath";' >> packages/engine-core/src/game/logic/index.ts
  ```

- [ ] Agregar a index.ts principal:
  ```bash
  echo 'export { findPath } from "./game/logic/index.ts";' >> packages/engine-core/src/index.ts
  ```

**Resultado Esperado**: Archivos copiados y adaptos

---

### Día 4: Tests y Validación

- [ ] Compilar core:
  ```bash
  npm run build -w packages/engine-core
  ```
  - [ ] Sin errores TypeScript

- [ ] Ejecutar tests:
  ```bash
  npm run test -w packages/engine-core -- pathfinding
  ```
  - [ ] Todos los tests pasan ✅
  - [ ] Sin warnings de agnósticidad

- [ ] Lint:
  ```bash
  npm run lint -- packages/engine-core/src/game/logic/pathfinding/
  ```
  - [ ] Sin errores

**Resultado Esperado**: Pathfinding validado en core

---

### Día 5: Actualizar web-demo

- [ ] Encontrar todos los imports de findPath en web-demo:
  ```bash
  grep -r "from.*findPath\|from.*movement" apps/web-demo/app --include="*.ts" --include="*.tsx"
  ```

- [ ] Actualizar cada import:
  ```typescript
  // ANTES
  import { findPath } from "@/app/lib/engine/movement/findPath";
  
  // DESPUÉS
  import { findPath } from "@pointclick-engine/engine-core";
  ```

- [ ] Verificar que web-demo aún funciona:
  ```bash
  npm run dev:demo
  # Abrir navegador, verificar sin errores
  ```

- [ ] Tests de web-demo:
  ```bash
  npm run test -w apps/web-demo
  ```
  - [ ] Si hay tests, deben pasar

- [ ] Lint y build:
  ```bash
  npm run lint -w apps/web-demo
  npm run build
  ```

- [ ] Commit semana 4:
  ```
  feat(phase-2): extract pathfinding to engine-core
  
  - [x] Marked: pathfinding module copied to packages/engine-core/
  - [x] Marked: imports updated in core
  - [x] Marked: imports updated in web-demo
  - [x] Marked: tests passing for pathfinding
  - [x] Marked: web-demo still functional
  
  See docs/PHASE_2_QUICK_START.md (Semana 4 complete)
  ```

**Resultado Esperado**: Pathfinding en core, web-demo funcional ✅

---

## 📚 Semana 5: Sprint 2 - Extracción de Rules + State Store (5 días)

### Día 1-2: Extracción de Game Rules

- [ ] Auditar `app/lib/core/rules/*`:
  ```bash
  ls -la app/lib/core/rules/
  ```
  - [ ] Listar archivos
  - [ ] Verificar agnósticidad de cada uno

- [ ] Copiar archivos:
  ```bash
  cp -r app/lib/core/rules/* packages/engine-core/src/game/logic/rules/
  ```

- [ ] Copiar tests:
  ```bash
  cp -r app/lib/core/rules/*.test.ts packages/engine-core/src/game/logic/rules/ 2>/dev/null || true
  ```

- [ ] Actualizar imports internos en archivos copiados
  - [ ] Verificar no hay imports rotos

- [ ] Crear barrel export para rules:
  ```bash
  echo 'export * from "./rules/*";' >> packages/engine-core/src/game/logic/index.ts
  ```

**Resultado Esperado**: Rules en core

---

### Día 2-3: Extracción de State Store

- [ ] Auditar `app/store/sceneStore.ts`:
  - [ ] ¿Depende de React? Si sí, documentar y fijar
  - [ ] Verificar que solo depende de zustand

- [ ] Copiar archivo:
  ```bash
  cp app/store/sceneStore.ts packages/engine-core/src/game/state/sceneStore.ts
  ```

- [ ] Copiar tests (si existen):
  ```bash
  cp app/store/sceneStore.test.ts packages/engine-core/src/game/state/ 2>/dev/null || true
  ```

- [ ] Actualizar imports

- [ ] Crear barrel export:
  ```bash
  echo 'export { useSceneStore, getSceneState } from "./sceneStore";' > packages/engine-core/src/game/state/index.ts
  ```

- [ ] Agregar a index.ts principal:
  ```bash
  echo 'export { useSceneStore, getSceneState } from "./game/state";' >> packages/engine-core/src/index.ts
  ```

**Resultado Esperado**: State store en core

---

### Día 4: Validación Completa

- [ ] Compilar:
  ```bash
  npm run build -w packages/engine-core
  ```
  - [ ] Sin errores

- [ ] Tests:
  ```bash
  npm run test -w packages/engine-core
  ```
  - [ ] Todos pathfinding ✅
  - [ ] Todos rules ✅
  - [ ] Todos state store ✅

- [ ] Verificar agnósticidad nuevamente:
  ```bash
  grep -r "import.*react\|import.*@react-three" packages/engine-core/src/
  ```
  - [ ] Debe estar vacío

- [ ] Lint completo:
  ```bash
  npm run lint -w packages/engine-core
  ```
  - [ ] Sin errores

**Resultado Esperado**: Core validado con 3 módulos principales

---

### Día 5: Actualizar web-demo y Commit

- [ ] Actualizar imports en web-demo:
  ```bash
  grep -r "from.*rules\|from.*sceneStore" apps/web-demo/app --include="*.ts" --include="*.tsx"
  # Cambiar cada import a @pointclick-engine/engine-core
  ```

- [ ] Validar web-demo:
  ```bash
  npm run dev:demo
  # Juego en navegador sin errores
  ```

- [ ] Lint y build web-demo:
  ```bash
  npm run lint -w apps/web-demo
  npm run build
  ```

- [ ] Commit semana 5:
  ```
  feat(phase-2): extract rules and state store to engine-core
  
  - [x] Marked: rules modules copied to core
  - [x] Marked: state store (sceneStore) copied to core
  - [x] Marked: all imports updated in web-demo
  - [x] Marked: core tests passing (pathfinding + rules + state)
  - [x] Marked: agnósticidad verified
  - [x] Marked: web-demo still functional
  
  See docs/PHASE_2_QUICK_START.md (Semana 5 complete)
  ```

**Resultado Esperado**: 3 módulos principales en core ✅

---

## ✅ Semana 6: Integración + Gate de Validación (5 días)

### Día 1-2: Limpiar y Documentar

- [ ] Actualizar `CLAUDE.md`:
  - [ ] Sección de estructura con nueva ubicación de files
  - [ ] Ejemplos de import desde @pointclick-engine/engine-core

- [ ] Actualizar `docs/ARCHITECTURE.md`:
  - [ ] Agregar sección: "Estructura post-Fase 2"
  - [ ] Actualizar diagrama de dependencias

- [ ] Crear `docs/ENGINE_CORE_API.md`:
  - [ ] Listar público exports de engine-core
  - [ ] Documentar tipos y funciones

- [ ] Limpiar archivos viejos en app/:
  - [ ] ¿Borrar `app/lib/core/`?
  - [ ] ¿Borrar `app/store/sceneStore.ts`?
  - [ ] **REVISAR**: ¿Hay otros archivos que dependían?

**Resultado Esperado**: Documentación actualizada

---

### Día 3: Gate de Validación - Agnósticidad

```bash
# VALIDACIÓN 1: Sin React en core
grep -r "import.*react" packages/engine-core/src/
# Resultado esperado: NADA (empty)
# ✅ Si vacío, marcar check
# ⚠️ Si hay resultados: listar y documentar como blocking issue
```

- [ ] Agnósticidad: Sin React
  - [ ] Check si resultado vacío

```bash
# VALIDACIÓN 2: Sin R3F en core
grep -r "import.*@react-three" packages/engine-core/src/
# Resultado esperado: NADA
```

- [ ] Agnósticidad: Sin R3F
  - [ ] Check si resultado vacío

```bash
# VALIDACIÓN 3: Sin Next.js en core
grep -r "import.*next" packages/engine-core/src/
# Resultado esperado: NADA
```

- [ ] Agnósticidad: Sin Next.js
  - [ ] Check si resultado vacío

**Resultado Esperado**: Core verificado como agnóstico ✅

---

### Día 3: Gate de Validación - Tests

```bash
npm run test -w packages/engine-core
```

- [ ] Tests de core: todos pasan ✅
  - [ ] Si hay failures: fix + re-run hasta pasar

**Resultado Esperado**: 100% tests passing

---

### Día 4: Gate de Validación - Build y Funcionalidad

```bash
# VALIDACIÓN 4: Build sin errores
npm run build
```

- [ ] Build de todo el workspace: ✅
  - [ ] Si hay errores: listar y fijar

```bash
# VALIDACIÓN 5: Web-demo aún funciona
npm run dev:demo
```

- [ ] Abrir navegador: http://localhost:3000
- [ ] [ ] Juego carga sin errores
- [ ] [ ] Movimiento funciona (WASD)
- [ ] [ ] Inventario funciona
- [ ] [ ] Cambio de escena funciona
- [ ] [ ] Editor debug funciona (en /debug)

**Resultado Esperado**: Demo operacional sin cambios

---

### Día 4: Gate de Validación - Imports Actualizados

```bash
# VALIDACIÓN 6: Imports en web-demo actualizados
grep -r "@/app/lib/core/\|@/app/lib/engine/movement/\|@/app/store/sceneStore" apps/web-demo/app
# Resultado esperado: NADA
```

- [ ] Imports de core: ninguno desde app/, todo de @pointclick-engine/engine-core
  - [ ] Si hay resultados: actualizar imports

**Resultado Esperado**: Importaciones correctas

---

### Día 5: Documentación Final + Commit

- [ ] Crear `docs/PHASE_2_COMPLETION_REPORT.md`:
  - [ ] Resumen de cambios
  - [ ] Tamaño final de packages/engine-core/
  - [ ] Número de archivos movidos
  - [ ] Coverage de tests
  - [ ] Lessons learned

- [ ] Marcar todos los checks en `docs/PHASE_2_QUICK_START.md`

- [ ] Actualizar `docs/PROJECT_STATUS_ASSESSMENT.md`:
  - [ ] Cambiar "Fase 1 (Análisis)" → "Fase 2 (Completada)"

- [ ] Commit final:
  ```
  feat(phase-2): complete core extraction - GATE PASSED ✅
  
  VALIDATION CHECKLIST:
  - [x] Agnósticidad: Sin React/R3F/Next.js verificado
  - [x] Tests: 100% pasando en engine-core
  - [x] Build: npm run build sin errores
  - [x] Funcionalidad: web-demo operacional
  - [x] Imports: Todos actualizados (@pointclick-engine/engine-core)
  
  Archivos movidos:
  - app/lib/core/rules/* → packages/engine-core/src/game/logic/rules/
  - app/lib/engine/movement/findPath.ts → packages/engine-core/src/game/logic/pathfinding/
  - app/store/sceneStore.ts → packages/engine-core/src/game/state/
  
  See docs/PHASE_2_COMPLETION_REPORT.md
  ```

- [ ] Merge a main (si en rama separada)

**Resultado Esperado**: Fase 2 COMPLETADA ✅

---

## 📈 Resumen Post-Fase 2

- [ ] **Core agnóstico**: 100% verificado
- [ ] **Monorepo**: Funcional con 2 workspaces (engine-core, web-demo)
- [ ] **Tests**: Coverage en pathfinding, rules, state
- [ ] **Documentación**: Actualizada, clara
- [ ] **Demo**: Aún operacional sin cambios visuales

**Próximo**: Fase 3 - Abstracción del Renderer (Semanas 7-10)

---

**Creado**: 2026-05-23  
**Última actualización**: 2026-05-23  
**Owner**: Daniel Martínez Sebastián

---

## 🔗 Referencias

- `docs/PHASE_2_QUICK_START.md` - Guía ejecutable
- `docs/PHASE_2_DETAILED_PLAN.md` - Detalles completos
- `docs/PROJECT_STATUS_ASSESSMENT.md` - Estado vs objetivos
- `CLAUDE.md` - Principios y guía de contribución
