# Architecture: Walls with Openings (Doors/Windows)

**Status**: Design phase | **Owner**: Feature planning

---

## Problema Identificado

El sistema actual de muros es **solid boxes** sin soporte para:
1. **Puertas/ventanas**: Ranuras por donde pueden pasar colisiones (NPCs)
2. **Texturas de muro**: Planos para visualizar el muro con imagen (no solo wireframe en debug)
3. **Camera-fixed rendering**: La imagen del muro debe estar paralela al fondo (no distorsionarse con cámara)

Caso de uso: Crear una escena donde una pared con ventana tiene un marco visual que coincida con el fondo de fondo, con la ventana como área transitable.

---

## Análisis Actual

### GameSceneWall (core)
```typescript
interface GameSceneWall {
  position: GameVec3;        // Centro en 3D
  halfSize: GameVec3;        // Dimensiones [X, Y, Z]
  rotationY: number;         // Rotación alrededor eje Y
}
```

**Observación**: Solo define geometry de colisión, sin rendering.

### Pathfinding (core)
- Convierte `GameSceneWall` → `MovementObstacle`
- Usa `position`, `halfSize`, `rotationY` para evitar colisiones
- Si agregamos openings, pathfinding debe saber "esta parte es transitable"

### SceneWalls Renderer (R3F)
- Crea `RigidBody (fixed) + CuboidCollider` para cada wall
- En debug: wireframe mesh (`boxGeometry`) editable
- **No tiene**: renderizado visual del muro con textura

### SceneBackgroundPlane (R3F)
- Sigue cámara: `position = camera.position + direction * distance`
- Copia quaternion de cámara → siempre perpendicular a view
- `depthTest=false, depthWrite=false` → no interfiere
- `renderOrder=-100` → dibujado primero
- Aspect ratio del muro debe coincidir con imagen

---

## Propuesta: Arquitectura de Openings

### 1. Extender GameSceneWall (Core)

```typescript
interface GameSceneWallOpening {
  id: string;
  position: GameVec3;      // Centro del corte respecto al muro
  halfSize: GameVec3;      // Dimensiones del hueco [X, Y, Z]
}

interface GameSceneWall {
  position: GameVec3;
  halfSize: GameVec3;
  rotationY: number;
  // NEW:
  openings?: GameSceneWallOpening[];  // Array de puertas/ventanas
  textureUrl?: string;                // URL a imagen del muro (opcional)
  texturePosition?: GameVec3;         // Offset de la textura dentro del muro
}
```

**Criterio**: `openings` y `textureUrl` son **renderer hints**, core solo sabe que existen.

### 2. Actualizar Pathfinding (Core)

**Principio**: Un opening es un "obstáculo negativo" en colisión de muros.

```typescript
// En findPath: convertir muros a obstáculos
// ANTES: walls.map(wall => toObstacle(wall))
// DESPUÉS: necesita lógica de resta de obstáculos

type MovementObstacle = {
  x: number;
  z: number;
  halfX: number;
  halfZ: number;
  rotationY: number;
  // NEW:
  subtractions?: Array<{ x, z, halfX, halfZ }>;  // Openings que restan del obstáculo
};
```

**Implementación**: Función `isPointInWallOpening()` que, al validar si punto golpea muro, también verifica si está dentro de algún opening.

### 3. Renderer: WallPlane Component (R3F)

Nuevo componente que renderiza la textura del muro **paralelo a la cámara** como el background:

```typescript
// apps/web-demo/app/lib/engine/render/scene/SceneWallPlane.tsx
export function SceneWallPlane({ 
  wall, 
  wallIndex 
}: { 
  wall: GameSceneWall, 
  wallIndex: number 
}) {
  // Similar a SceneBackgroundPlane:
  // - Carga textureUrl
  // - useFrame para seguir cámara
  // - Posición = wall.position proyectado a camera plane
  // - Quaternion = camera.quaternion
  // - renderOrder = wallIndex (para z-sorting)
  // - depthTest = false
}
```

**Clave**: Debe renderizarse **atrás** del jugador pero **adelante** del background.

### 4. Debug Editor UI

Extender `WallEditorPanel` para:
1. **Ver/editar openings** de muro seleccionado
   - Lista de openings con botón "+ Agregar opening"
   - Para cada opening: inputs [X, Y, Z] posición + [SX, SY, SZ] halfSize
   - Botones delete/duplicate
2. **Asignar textura**
   - Input file-picker → file en `/public/assets/wall-textures/`
   - Preview en el 3D mientras editas
3. **Ajustar textura**
   - `texturePosition` [X, Y, Z] para mover la imagen dentro del muro
   - En el 3D ver previsualización

**Constraint**: Editores de openings NO deben estar en core (son solo datos en editor).

---

## Problemas Técnicos a Resolver

### 1. Alineación Textura ↔ Background

**Problema**: La textura del muro es plano 2D paralelo a cámara (como background). ¿Cómo sabe dónde dibujarse respecto a la geometría 3D?

**Solución**:
- Muro define posición 3D, dimensions, rotación
- Textura debe coincidir visualmente con el fondo
- En debug mode: ver tanto la caja wireframe del muro como la textura superpuesta
- Usuario ajusta `texturePosition` viendo la alineación en tiempo real

### 2. Z-sorting de Múltiples Texturas

Si hay varios muros con texturas, ¿cuál dibuja adelante?

**Solución**: `renderOrder = wallIndex` (ordena por índice de muro en `walls[]`).

### 3. Performance

Cargar texturas es costoso. ¿Lazy-load?

**Solución**: Cache en `useEffect` + cleanup (como SceneBackgroundPlane hace).

### 4. Colisiones Complejas

¿Qué pasa si opening se traslapan o extends fuera del muro?

**Solución**:
- Validar openings en debug (advertencia si half-size es > que muro)
- En pathfinding, asumir que si el punto está en un opening, es transitable
- Documentar el contrato: "openings deben estar dentro del muro"

---

## Plan de Implementación (Fases)

### Fase A: Extender Tipos (Core)
- [ ] Agregar `GameSceneWallOpening` interface
- [ ] Extender `GameSceneWall` con `openings[]`, `textureUrl`, `texturePosition`
- [ ] Tests para new types

### Fase B: Pathfinding + Colisiones (Core)
- [ ] Función `isPointInWallOpening(point, wall, opening)`
- [ ] Actualizar `isSegmentClear()` para restar openings de obstáculos
- [ ] Tests de pathfinding con openings

### Fase C: Renderizar Texturas (Renderer)
- [ ] `SceneWallPlane.tsx` (follower de cámara como background)
- [ ] Integrar en GameTouchCanvas render loop
- [ ] Cargar + cache texturas

### Fase D: Editor Debug UI (Demo)
- [ ] Extender `WallEditorPanel` para openings
- [ ] Modal/panel para agregar/editar opening
- [ ] File picker para textureUrl
- [ ] Inputs para texturePosition

### Fase E: Validación + Docs
- [ ] Docs: "Cómo agregar una puerta/ventana"
- [ ] Tests end-to-end: pathfinding + rendering
- [ ] Advertencias en debug si openings son inválidos

---

## Backward Compatibility

- `openings` es array vacío por defecto → muro se comporta como ahora
- `textureUrl` opcional → sin textura = sin renderizar plano extra
- Existente `GameSceneWall` sigue siendo válida

---

## Referencias

- `docs/architecture/01-layers.md` — capas
- `docs/architecture/03-rules-core-vs-render.md` — dónde va el código
- `packages/engine-core/src/game/logic/pathfinding/findPath.ts` — lógica de colisión
- `apps/web-demo/app/components/scene/SceneBackgroundPlane.tsx` — cómo renderizar paralelo a cámara
