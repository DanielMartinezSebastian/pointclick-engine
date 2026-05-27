# Visual Guide: Walls with Openings Feature

**Reference**: `docs/architecture/07-walls-with-openings.md`

---

## 📐 Antes vs Después (Data Model)

### ANTES (v0.1.0 - Current)

```
GameSceneWall {
  position: [x, y, z]
  halfSize: [x, y, z]
  rotationY: number
}

Visual: Wireframe box en debug (no textura)
Colisión: Solid box (sin huecos)
Pathfinding: Todo el muro es obstáculo
```

### DESPUÉS (v0.2.0 - With Openings)

```
GameSceneWall {
  position: [x, y, z]
  halfSize: [x, y, z]
  rotationY: number
  
  openings?: [                           // NEW
    {
      id: string
      position: [x, y, z]     // Offset dentro del muro
      halfSize: [x, y, z]     // Dimensiones del hueco
    }
  ]
  
  textureUrl?: string                    // NEW
  texturePosition?: [x, y, z]           // NEW
}

Visual: Textura plana (paralela a cámara) + wireframe en debug
Colisión: Solid box CON excepciones en openings
Pathfinding: Obstáculo MENOS openings = pathfinding pasa por puertas
```

---

## 🎮 Visual: Cómo Se Ve en Pantalla

### Player View (Arriba = Fondo, Abajo = Primer Plano)

```
[Background Plane]  ← Imagen de escena (paralela a cámara)
                      renderOrder = -100
                      depthTest = false
                      
[Wall Textures]     ← NUEVO: Texturas de muros
                      renderOrder = 0 a 10
                      depthTest = false
                      (Sigue cámara como background)
                      
[3D Geometry]       ← Sprites, colliders, etc.
                      renderOrder = 11+
                      depthTest = true
                      
[UI/Debug Panel]    ← Overlay en HTML
                      zIndex = 10000+
```

### En Debug Mode: Editor Vista Superior

```
Muro seleccionado (wireframe amarillo):

    Z axis
    ↑
    │     halfSize[2] = ancho del muro
    │     ├──────────────┐
    │ y  │ Opening 1     │
    ├────┼   (puerta)    │
    │    │  ┌────────┐   │
    │    │  │ [  ]   │   │
    │    │  └────────┘   │
    │    │               │
    │    └──────────────┘
    │ halfSize[0] = altura del muro
    └──────────────────────→ X axis
    
    • Muro posición: [5, 0, 5] (centro)
    • Muro halfSize: [1, 2, 0.2] (ancho=1, alto=2, profundidad=0.2)
    • Opening posición: [0, 0.5, 0] (centrado horizontalmente, arriba)
    • Opening halfSize: [0.4, 0.8, 0.1] (puerta)
```

---

## 🔄 Pathfinding: Cómo Pasa por Puertas

### Lógica Actual (v0.1.0)

```
findPath(start, goal, walls, ...):
  for wall in walls:
    obstacle = toObstacle(wall)
    if path intersects obstacle:
      return [path with waypoints around wall]
  return [goal]
```

### Lógica Nueva (v0.2.0)

```
findPath(start, goal, walls, ...):
  for wall in walls:
    obstacle = toObstacle(wall)
    if path intersects obstacle:
      // NUEVO: Revisar si el punto está dentro de un opening
      for opening in wall.openings || []:
        if isPointInWallOpening(segment, wall, opening):
          continue  // Este segmento es transitable, no es obstáculo
      return [path with waypoints around wall]
  return [goal]


isPointInWallOpening(point, wall, opening):
  // Transformar punto a espacio local del muro
  localPoint = transform(point, wall.position, wall.rotationY)
  
  // ¿Está dentro del opening?
  if abs(localPoint.x) <= opening.halfSize[0] AND
     abs(localPoint.y) <= opening.halfSize[1] AND
     abs(localPoint.z) <= opening.halfSize[2]:
    return true
  return false
```

### Ejemplo: NPC Intenta Pasar

```
ESCENA:
┌─────────────────────────────┐
│  NPC        [Pared con]     │
│              puerta]        │
│                             │
│  GOAL                       │
└─────────────────────────────┘

PATHFINDING CALCULA:
1. Línea recta NPC → GOAL cruza la pared
2. Chequea si cruce está en algún opening
3. SÍ: está en la puerta
   → Ruta directa: [GOAL]
   
4. NO: fuera de opening
   → Ruta alrededor: [waypoint1, waypoint2, GOAL]
```

---

## 🎨 Rendering: Camera-Parallel Texture Planes

### Concepto: "Sombra" de la Cámara

```
┌─────────────────────────────┐  RENDERING PIPELINE
│                             │
│  Camera                     │
│  ●─────── viewport ─────┐   │
│   \                      \  │
│    \                      \ │
│     ╲                      ╲│
│      ╲  Wall position      │ ← Wall plane renderizado
│       ╲ [5, 0, 5]          │   AQUÍ (camera-parallel)
│        ╲                   │
│         ╲3D World          │
│          ╲geometry         │
└─────────────────────────────┘

Posición de Wall Plane:
  position = camera.position 
           + camera.direction * distance
  quaternion = camera.quaternion
  
Resultado: ¡Siempre paralelo a la vista, nunca distorsionado!
```

### Implementación (Three.js / R3F)

```typescript
// ACTUAL: SceneBackgroundPlane
useFrame(({ camera }) => {
  meshRef.current.position.copy(camera.position)
    .addScaledVector(dir, 10)              // 10 unidades adelante
  meshRef.current.position.x = groundCenterX // Centra en X
  meshRef.current.quaternion.copy(camera.quaternion)
  
  // depthTest=false → no interfiere con depth buffer
  // renderOrder=-100 → dibuja primero (atrás del todo)
})

// NUEVO: SceneWallPlane (misma técnica)
useFrame(({ camera }) => {
  meshRef.current.position.copy(camera.position)
    .addScaledVector(dir, 10)              // Misma distancia
  
  // Ajustar por texturePosition (offset para alineación)
  meshRef.current.position.add(wall.texturePosition)
  
  meshRef.current.quaternion.copy(camera.quaternion)
  
  // renderOrder = wallIndex (z-sort múltiples texturas)
})
```

---

## 🛠️ Editor Debug: Flujo de Edición

### Vista Previa de Edición en 3D

```
PANTALLA SPLIT:

┌─────────────────────┬──────────────────────┐
│  3D Viewport        │  Debug Panel (left)  │
│                     │                      │
│  [Wireframe wall]   │ Escenario: Plaza    │
│   ├─ puerta         │ Modo: walls          │
│   │  ├─ [  ]        │ Muro sel: 1          │
│   │  └─ visible     │ Pos: [5, 0, 5]      │
│   └─ texture        │ HalfSize: [1, 2, 0.2]│
│     (alineada)      │                      │
│                     │ Openings (2):        │
│ [Background]        │ • door-1             │
│                     │   Pos: [0, 0.5, 0]  │
│                     │   Size: [0.4, 1, .1]│
│                     │ • window-1           │
│                     │   Pos: [0, 1.5, 0]  │
│                     │   Size: [0.3, 0.3,.1]
│                     │ + Agregar opening    │
│                     │                      │
│                     │ Textura:             │
│                     │ [file picker]        │
│                     │ door-frame.png       │
│                     │ Pos: [0, 0, 0]       │
└─────────────────────┴──────────────────────┘
```

### Workflow: Crear Puerta

```
1. Seleccionar muro → Ver en wireframe

2. Panel Editor:
   a. Click "+ Agregar opening"
   b. Input posición [0, 0.5, 0]
   c. Input halfSize [0.4, 1, 0.1]
   
3. En 3D: Ver opening renderizado
   a. Wireframe muestra ubicación
   b. Pathfinding simulation (opcional)
   
4. Asignar textura:
   a. File picker → door-frame.png
   b. Ajustar texturePosition [0, -0.2, 0]
   c. Ver texture align con background
   
5. Save
   → Wall actualizada en sceneStore
   → Persiste en scene config
```

---

## 🧪 Testing Strategy

### Unit Tests (Core)

```typescript
// pathfinding.test.ts
describe("isPointInWallOpening", () => {
  it("should detect point inside opening", () => {
    const wall = { position: [0,0,0], ... }
    const opening = { position: [0,0,0], halfSize: [1,1,1] }
    const point = [0.5, 0.5, 0.5]  // Inside
    
    expect(isPointInWallOpening(point, wall, opening))
      .toBe(true)
  })
  
  it("should detect point outside opening", () => {
    const point = [2, 0, 0]  // Outside
    expect(isPointInWallOpening(point, wall, opening))
      .toBe(false)
  })
})

describe("findPath with openings", () => {
  it("should allow path through opening", () => {
    const walls = [{
      position: [0, 0, 0],
      halfSize: [2, 2, 0.2],
      openings: [{ position: [0, 0, 0], halfSize: [0.5, 2, 0.1] }]
    }]
    
    // NPC crosses through opening
    const path = findPath({
      start: [-2, 0],
      goal: [2, 0],
      walls, ...
    })
    
    expect(path).toEqual([[2, 0]])  // Direct path
  })
})
```

### Integration Tests (E2E)

```typescript
// editor.e2e.test.ts
describe("Wall Openings in Debug Mode", () => {
  it("should create, edit, delete opening", async () => {
    // 1. Load scene in debug mode
    // 2. Select wall, add opening
    // 3. Verify in 3D view (wireframe)
    // 4. Verify in sceneStore
    // 5. Delete opening
    // 6. Verify state updated
  })
  
  it("should align texture with background", async () => {
    // 1. Load scene with texture
    // 2. Adjust texturePosition
    // 3. Visual check (texture + background align)
  })
  
  it("pathfinding respects openings", async () => {
    // 1. Create wall with opening
    // 2. Query pathfinding
    // 3. Verify NPC can cross
  })
})
```

---

## 📊 Data Flow Diagram

```
[EDIT]
  ↓
DebugOverlayPanel
  ├─ WallEditorPanel.tsx
  │  └─ Inputs: position, halfSize, openings[], textureUrl
  │
[STATE]
  ↓
sceneEditorStore (demo local)
  ├─ selectWall()
  ├─ addOpening()
  ├─ updateOpening()
  ├─ removeOpening()
  └─ updateTextureUrl()
  
[PERSIST]
  ↓
useSceneStore (engine-core)
  ├─ sceneStore.updateWall()
  └─ sceneStore.scene.walls[i] = { ...openings, textureUrl }

[VALIDATE]
  ↓
Pathfinding (core)
  ├─ isPointInWallOpening()
  └─ findPath() respects openings

[RENDER]
  ↓
GameTouchCanvas
  ├─ SceneWalls (wireframe + colliders)
  ├─ SceneWallPlane (NEW: texturas paralelas)
  ├─ SceneBackgroundPlane
  └─ Sprites + UI

[OUTPUT]
  ↓
Player sees:
  • Background image (centered)
  • Wall textures (aligned with background)
  • NPCs move through doors (pathfinding respects openings)
  • Can edit all from debug panel (live preview)
```

---

## 🔐 Invariants & Constraints

### Invariantes (MUST be true)

```
1. Wall.openings[i].position is within Wall bounds
   → Validation: warn if opening extends outside wall

2. Wall.textureUrl points to valid image (or undefined)
   → Validation: console.warn if 404

3. Pathfinding with openings = pathfinding without openings (if openings=[])
   → Tests: backward compatibility

4. Core imports ≠ React/R3F
   → Tests: grep "import.*from \"react\"" in core/src/
```

### Constraints (SHOULD be respected)

```
1. SceneWallPlane renders BEFORE sprites (lower renderOrder)
   → Reasoning: texture behind interactive elements

2. texturePosition alignment is manual by user
   → Reasoning: engine can't guess intent of texture placement
   
3. Opening size should be ≤ wall size
   → Reasoning: UX check (warn in debug, allow anyway)
```

---

## 📚 Code Examples (Post-Implementation)

### Creating a Wall with Door (JSON)

```json
{
  "walls": [
    {
      "position": [5, 0, 5],
      "halfSize": [2, 3, 0.2],
      "rotationY": 0,
      "openings": [
        {
          "id": "door-main",
          "position": [0, 0.5, 0],
          "halfSize": [0.6, 2, 0.1]
        }
      ],
      "textureUrl": "/assets/wall-textures/wooden-door-frame.png",
      "texturePosition": [0, -0.3, 0]
    }
  ]
}
```

### Editing from Debug Mode (React)

```typescript
// User flow in WallEditorPanel:

1. Select wall (dropdown or click in 3D)
2. Panel shows openings list
3. Click "+ Add Opening"
   → New modal/panel for inputs
4. Input position [0, 0.5, 0], halfSize [0.6, 2, 0.1]
5. Live preview: wireframe opening appears in 3D
6. Pick texture file: file dialog → door-frame.png
7. Adjust texturePosition with inputs
8. Save → sceneStore updates → pathfinding recalcs
```

---

## ✅ Checklist: Feature Complete

- [ ] Core types extended (GameSceneWallOpening)
- [ ] Pathfinding updated (isPointInWallOpening)
- [ ] SceneWallPlane renderer created
- [ ] WallEditorPanel extended for openings CRUD
- [ ] Texture alignment working (live preview)
- [ ] Unit tests: 100% pass
- [ ] E2E tests: opening/pathfinding/rendering
- [ ] Backward compatible (all 0.1.0 scenes still work)
- [ ] Documentation complete
- [ ] Ready for v0.2.0 release

---

**Document**: Visual guide for Walls with Openings feature
**Reference**: See `docs/architecture/07-walls-with-openings.md` for detailed design
**Date**: 2026-05-27
**Status**: ✅ Design Complete, Ready to Implement
