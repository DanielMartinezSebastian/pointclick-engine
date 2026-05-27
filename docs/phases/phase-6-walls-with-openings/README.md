# Phase 6: Walls with Openings (Doors/Windows)

**Status**: Planning | **Owner**: Feature development | **Version target**: v0.2.0

---

## 🎯 Objetivo

Extender el sistema de muros para soportar:
1. **Openings** (puertas/ventanas): Ranuras por donde pasan colisiones
2. **Wall Textures**: Imágenes de muros paralelas a la cámara (como background)
3. **Debug Editor**: Interfaz para crear, editar y alinear openings + texturas

---

## 📋 Características Clave

### Para Jugador

- Crear un muro con puerta/ventana desde el debug mode
- Definir:
  - Posición y tamaño del corte (opening)
  - Imagen del muro (archivo en `/public`)
  - Ajustar posición de la imagen para alineación con fondo
- Ver previsualización en tiempo real
- Las colisiones respetan los openings (NPCs pueden pasar)

### Para Arquitectura

- **Core (agnóstico)**:
  - `GameSceneWall` extendida con `openings[]` + `textureUrl`
  - Pathfinding actualizado para restar openings de obstáculos
  - Zero breaking changes (backward compatible)

- **Renderer (R3F)**:
  - `SceneWallPlane.tsx` → renderiza textura paralela a cámara
  - Integración en game loop

- **Demo/Debug**:
  - `WallEditorPanel` extendido para openings + texturas
  - File picker para imágenes
  - Live preview en 3D

---

## 🏛️ Arquitectura Propuesta

### 1. Core Types (agnóstico)

```typescript
// packages/engine-core/src/game/types/index.ts
interface GameSceneWallOpening {
  id: string;
  position: GameVec3;    // Offset del opening respecto al muro
  halfSize: GameVec3;    // Dimensiones del hueco
}

interface GameSceneWall {
  position: GameVec3;
  halfSize: GameVec3;
  rotationY: number;
  // NEW:
  openings?: GameSceneWallOpening[];
  textureUrl?: string;
  texturePosition?: GameVec3;
}
```

### 2. Pathfinding (core logic update)

Actualizar `findPath()` para validar openings:

```typescript
function isPointInWallOpening(point, wall, opening): boolean {
  // Transformar punto a espacio local del muro
  // Comprobar si está dentro del opening
}

// En isSegmentClear():
// Si colisiona con muro, verificar también si está dentro de un opening
// Si está dentro: es transitable
```

### 3. Renderer (R3F)

Nuevo componente `SceneWallPlane.tsx`:

```typescript
// Sigue cámara como SceneBackgroundPlane
// position = wall.position proyectado a camera plane + texturePosition offset
// quaternion = camera.quaternion
// renderOrder = wallIndex
// depthTest = false, depthWrite = false
```

### 4. Editor (Demo UI)

Extender `WallEditorPanel.tsx`:

```
WallEditorPanel
├─ Current: Posición, halfSize, rotación
├─ NEW: Lista de openings
│   ├─ Botón: + Agregar opening
│   └─ Para cada opening:
│       ├─ Inputs: [X, Y, Z] posición
│       ├─ Inputs: [SX, SY, SZ] halfSize
│       └─ Botón: eliminar
├─ NEW: Selector de textura
│   ├─ File picker → /public/assets/wall-textures/
│   └─ Preview URL
└─ NEW: Ajuste de textura
    ├─ Inputs: [X, Y, Z] texturePosition
    └─ Live preview en 3D
```

---

## 📍 Distribución de Archivos

### Core (packages/engine-core/)

```
src/game/types/index.ts
  └─ ADD: GameSceneWallOpening interface
     UPDATE: GameSceneWall with openings, textureUrl, texturePosition

src/game/logic/pathfinding/findPath.ts
  └─ ADD: isPointInWallOpening()
     UPDATE: isSegmentClear() to account for openings

__tests__/pathfinding.test.ts
  └─ ADD: Tests para openings in pathfinding
```

### Renderer (apps/web-demo/)

```
app/lib/engine/render/scene/SceneWallPlane.tsx
  └─ NEW: Component para renderizar texturas paralelas a cámara

app/lib/engine/render/scene/SceneWalls.tsx
  └─ UPDATE: Integrar SceneWallPlane en render loop

app/lib/engine/components/GameTouchCanvas.tsx
  └─ UPDATE: Pasar openings data al renderer
```

### Demo/Debug (apps/web-demo/)

```
app/components/debug/WallEditorPanel.tsx
  └─ EXTEND: Agregar editor de openings y texturas

app/components/debug/WallOpeningEditor.tsx
  └─ NEW: Subcomponente para editar un opening

app/store/sceneEditorStore.ts
  └─ UPDATE: Métodos para CRUD de openings

app/lib/engine/types/gameRuntime.ts
  └─ (No cambios, types ya están en core)
```

### Documentación

```
docs/architecture/07-walls-with-openings.md
  └─ CREATED: Design doc (✅ done)

docs/DEBUG_MODE_REVIEW.md
  └─ CREATED: Status del debug mode (✅ done)

docs/phases/phase-6-walls-with-openings/
  └─ README.md (este archivo)
  └─ tasks/ (tareas modularizadas)
     ├─ 01-extend-core-types.md
     ├─ 02-update-pathfinding.md
     ├─ 03-create-scene-wall-plane.md
     ├─ 04-extend-wall-editor-panel.md
     ├─ 05-extend-scene-editor-store.md
     ├─ 06-integration-testing.md
     ├─ 07-documentation-and-examples.md
     └─ 08-validation-gate.md
```

---

## 🔄 Proceso de Trabajo

### Para cada task:

1. Lee el archivo task: `docs/phases/phase-6-*/tasks/NN-*.md`
2. Ejecuta instrucciones autocontenidas
3. Marca `[x]` en `tracking.md` cuando Success Criteria validados
4. Commit atomic (ver `docs/workflow/commit-convention.md`)

### Pre-commit checklist (cada commit):

- [ ] Core no importa React/R3F
- [ ] Types del core no dependen de demo
- [ ] Tests pasan (npm test)
- [ ] Backward compatible (openings es opcional)
- [ ] Mensaje de commit referencia task (ej: "feat(phase-6): 01-extend-core-types")

---

## ✅ Success Criteria (Global)

- [ ] `GameSceneWall.openings[]` soportado en core (agnóstico)
- [ ] Pathfinding respeta openings (NPCs pueden pasar por puertas)
- [ ] `SceneWallPlane` renderiza texturas sin distorsión de cámara
- [ ] `WallEditorPanel` permite CRUD de openings + texturas
- [ ] Live preview en 3D mientras editas
- [ ] Backward compatible: muros sin openings se comportan igual
- [ ] 100% de tests pasando
- [ ] Documentación completa + ejemplos

---

## 📐 Estimación

| Phase | Tasks | Effort |
|-------|-------|--------|
| A. Core Types | 1 | 1 día |
| B. Pathfinding | 1 | 2 días |
| C. Renderer | 1 | 2 días |
| D. Editor UI | 2 | 2 días |
| E. Integration + Docs | 2 | 2 días |
| **Total** | **8 tasks** | **~10 días** |

---

## 🎯 Anti-Patterns (NO hacer)

- ❌ Agregar lógica de openings a UI (debe estar en store + core)
- ❌ Hardcodear rutas de texturas (usar URLs dinámicas)
- ❌ Romper backward compatibility (openings opcional, textureUrl opcional)
- ❌ Crear tipos custom en demo sin sugerencia de moverlos a core
- ❌ Omitir tests de pathfinding con openings

---

## 📖 Referencias

- `docs/architecture/01-layers.md` — arquitectura general
- `docs/architecture/03-rules-core-vs-render.md` — core vs renderer
- `docs/architecture/07-walls-with-openings.md` — design doc detallado
- `docs/DEBUG_MODE_REVIEW.md` — estado del debug mode
- `docs/workflow/commit-convention.md` — formato de commits
- `docs/workflow/pre-commit-checklist.md` — checks antes de commit

---

## 📝 Changelog

| Fecha | Acción |
|-------|--------|
| 2026-05-27 | Phase 6 planning + docs setup |
