# Task 01-extend-core-types

**Effort**: 1 day | **Blocks**: [02-update-pathfinding, 04-integrate-wall-plane] | **Blocked by**: none

---

## 🎯 Objetivo

Extender `GameSceneWall` en el core con soporte para openings (puertas/ventanas) y texturas, manteniendo backward compatibility.

---

## ✅ Success Criteria

- [ ] `GameSceneWallOpening` interface creada en core
- [ ] `GameSceneWall` extendida con campos opcionales: `openings[]`, `textureUrl`, `texturePosition`
- [ ] Todos los tests existentes de core pasan (backward compatible)
- [ ] Nuevos types están documentados con JSDoc
- [ ] `cloneWall()` y `cloneScene()` en sceneStore respetan los nuevos campos

---

## 📝 Instructions

### 1. Extender types en core

**Archivo**: `packages/engine-core/src/game/types/index.ts`

Después de `GameSceneWall` interface, agregar:

```typescript
/**
 * An opening (door/window) in a wall.
 * Position and halfSize are relative to the wall's local coordinates.
 */
export interface GameSceneWallOpening {
  id: string;                           // Unique identifier for this opening
  position: GameVec3;                   // Center of opening relative to wall
  halfSize: GameVec3;                   // Dimensions of the opening
}
```

Extender `GameSceneWall` interface:

```typescript
export interface GameSceneWall {
  position: GameVec3;
  halfSize: GameVec3;
  rotationY: number;
  
  // NEW FIELDS:
  /**
   * Array of openings (doors/windows) in this wall.
   * Empty array or undefined = solid wall (backward compatible).
   */
  openings?: GameSceneWallOpening[];
  
  /**
   * URL to the wall's texture image.
   * Should point to /public/assets/wall-textures/* or similar.
   * Undefined = no texture (backward compatible).
   */
  textureUrl?: string;
  
  /**
   * Position offset of the texture within the wall (world space).
   * Used for alignment with background image.
   * Defaults to [0, 0, 0].
   */
  texturePosition?: GameVec3;
}
```

### 2. Actualizar sceneStore.ts

**Archivo**: `packages/engine-core/src/game/state/sceneStore.ts`

Localizar función `cloneWall()` (~línea 46):

```typescript
function cloneWall(wall: GameSceneWall): GameSceneWall {
  return {
    position: [...wall.position] as [number, number, number],
    rotationY: wall.rotationY,
    halfSize: [...wall.halfSize] as [number, number, number],
    // ADD:
    openings: wall.openings
      ? wall.openings.map((opening) => ({
          id: opening.id,
          position: [...opening.position] as [number, number, number],
          halfSize: [...opening.halfSize] as [number, number, number],
        }))
      : undefined,
    textureUrl: wall.textureUrl,
    texturePosition: wall.texturePosition
      ? [...wall.texturePosition] as [number, number, number]
      : undefined,
  };
}
```

### 3. Crear archivo de tests

**Archivo**: `packages/engine-core/__tests__/wall-types.test.ts`

```typescript
import type { GameSceneWall, GameSceneWallOpening } from "../src/game/types";

describe("Wall types with openings", () => {
  it("should allow creating a wall without openings (backward compatible)", () => {
    const wall: GameSceneWall = {
      position: [0, 0, 0],
      halfSize: [1, 2, 1],
      rotationY: 0,
    };
    expect(wall.openings).toBeUndefined();
    expect(wall.textureUrl).toBeUndefined();
  });

  it("should allow creating a wall with openings", () => {
    const opening: GameSceneWallOpening = {
      id: "door-1",
      position: [0, 0.5, 0],
      halfSize: [0.5, 1, 0.1],
    };
    const wall: GameSceneWall = {
      position: [5, 0, 5],
      halfSize: [2, 3, 0.2],
      rotationY: Math.PI / 2,
      openings: [opening],
      textureUrl: "/assets/wall-textures/door-frame.png",
      texturePosition: [0, 0, 0],
    };
    expect(wall.openings).toHaveLength(1);
    expect(wall.textureUrl).toBeDefined();
  });

  it("should support multiple openings in a wall", () => {
    const wall: GameSceneWall = {
      position: [0, 0, 0],
      halfSize: [3, 2, 0.2],
      rotationY: 0,
      openings: [
        { id: "window-1", position: [-1, 1, 0], halfSize: [0.4, 0.5, 0.1] },
        { id: "window-2", position: [1, 1, 0], halfSize: [0.4, 0.5, 0.1] },
      ],
    };
    expect(wall.openings).toHaveLength(2);
  });
});
```

### 4. Verificar distribución

Asegurar que los nuevos types se exportan en:

**Archivo**: `packages/engine-core/src/index.ts`

Verificar que `GameSceneWall` se exporta (debería ya estar):

```typescript
export type {
  GameSceneWall,
  GameSceneWallOpening,  // ADD THIS
  GameSceneGround,
  // ... rest of exports
} from "./game/types";
```

### 5. Verificar el build

```bash
cd packages/engine-core
npm run build
```

Debe completar sin errores.

---

## 🧪 Validation

1. **Tests de tipos**:
   ```bash
   cd packages/engine-core
   npm test -- --testPathPattern=wall-types
   ```
   Deben pasar 3/3 tests.

2. **Backward compatibility**:
   ```bash
   npm test -- --testPathPattern=sceneStore
   ```
   Todos los tests existentes deben pasar.

3. **Build**:
   ```bash
   npm run build
   ```
   Debe completar sin errores de TypeScript.

4. **Visual check**:
   - Abrir `packages/engine-core/src/game/types/index.ts`
   - Verificar que `GameSceneWallOpening` está bien tipada
   - Verificar que `GameSceneWall` tiene los 3 campos nuevos opcionales

---

## 📚 References

- `docs/architecture/07-walls-with-openings.md` — design doc
- `packages/engine-core/src/game/types/index.ts` — tipos core
- `packages/engine-core/src/game/state/sceneStore.ts` — cloneWall()
- `docs/architecture/03-rules-core-vs-render.md` — core vs renderer

---

## 🎯 Next Steps

Después de completar esta tarea:

1. Task 02 extenderá pathfinding para usar los nuevos openings
2. Task 03 creará el renderer para texturas
3. Task 05 extenderá el editor de debug para CRUD de openings
