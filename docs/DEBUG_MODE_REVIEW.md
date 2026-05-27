# Debug Mode: Estado & Revisión Post-Refactorización

**Fecha**: 2026-05-27 | **Status**: Funcional, listo para features | **Owner**: Feature planning

---

## 🎯 Síntesis

El debug mode funciona correctamente post-refactorización. Todos los paneles editores (walls, ground, items, targets) están operacionales. **Listo para agregar features nuevas.**

---

## ✅ Documentación Obsoleta (Revisada)

### Archivada (NO usar como guía)
- `docs/_archive/PHASE_2_DETAILED_PLAN.md` 
- `docs/_archive/PHASE_2_QUICK_START.md` 
- `docs/_archive/PHASE_2_TRACKING.md` 
- `docs/_archive/PROJECT_STATUS_ASSESSMENT.md` 

**Acción**: Dejar en `_archive/` para referencia histórica. No generan ruido. ✅

### Documentación Vigente
Toda la documentación en `docs/architecture/`, `docs/workflow/`, `docs/decisions/` es correcta y actualizada.

---

## ✅ Tasks Obsoletas (Revisadas)

**Ninguna**. Los 32 tasks de las 5 fases completadas están marcados `[x]` correctamente.

---

## 🏗️ Arquitectura del Debug Mode

### Stack

```
Environment Variable (NEXT_PUBLIC_ENABLE_DEBUG=true)
    ↓
/debug/page.tsx (Next.js route guard)
    ↓
GameTouchCanvas.tsx
    ├─ useDebugModeEffects() → detecta ruta, inyecta CSS
    ├─ useDebugPanelController() → state del panel
    └─ DebugOverlayRuntimePanel → UI principal
       ├─ WallEditorPanel
       ├─ GroundEditorPanel
       ├─ InteractionTargetsEditorPanel
       └─ PlacedItemsEditorPanel
```

### Flujo de Estado

```
sceneEditorStore (demo-local)
    ↓ (mutaciones temp)
sceneStore (engine-core)
    ↓ (datos reales)
R3F Runtime (colisiones, pathfinding, rendering)
```

**Principio**: Editor usa store local (`sceneEditorStore`) que mutación el core (`sceneStore`). Core nunca conoce al editor.

### Archivos Clave

| Archivo | Rol | Líneas | Dependencias |
|---------|-----|--------|--------------|
| `runtime/useDebugModeEffects.ts` | Detectar `/debug`, CSS | 30 | React, Next.js nav |
| `runtime/useDebugPanelController.ts` | State del panel | 47 | React hooks |
| `components/DebugOverlayPanel.tsx` | UI presentacional | 267 | React |
| `components/debug/DebugOverlayRuntimePanel.tsx` | Conecta stores + UI | 147 | Zustand, sceneStore |
| `components/debug/WallEditorPanel.tsx` | Editor muros | 200+ | sceneEditorStore |
| `components/debug/GroundEditorPanel.tsx` | Editor suelo | ? | sceneEditorStore |
| `components/debug/InteractionTargetsEditorPanel.tsx` | Editor targets | ? | sceneEditorStore |
| `components/debug/PlacedItemsEditorPanel.tsx` | Editor items | ? | sceneEditorStore |
| `debug/page.tsx` | Route guard | 12 | Next.js |
| `types/gameRuntime.ts` | Tipos debug | 17 | (Pure types) |

---

## 🎮 Funcionalidades Actuales

### Panel Principal
- ✅ Toggle: suelo visible/oculto
- ✅ Toggle: muros visible/oculto
- ✅ Toggle: posición panel (left/right)
- ✅ Selector: cambiar escena
- ✅ Botón: respawn en spawn point
- ✅ Selector: modo editor (walls, ground, targets, items)

### Editor de Muros
- ✅ Selector: elegir muro por índice
- ✅ Inputs: posición [X, Y, Z]
- ✅ Inputs: halfSize [X, Y, Z]
- ✅ Input: rotación en grados
- ✅ Copiar JSON de todos los muros
- ✅ Selector: modo herramienta (manual, points)
- ✅ Botón: crear nuevo muro
- ✅ Botón: eliminar muro seleccionado
- ❌ **NO**: Openings (puertas/ventanas)
- ❌ **NO**: Textura del muro

### Editor de Suelo
- ✅ Inputs: limites [minX, maxX, minZ, maxZ, Y]

### Editor de Items Colocados
- ✅ Lista de items con posición editable
- ✅ Botón: mover a jugador
- ✅ Botón: eliminar

### Editor de Targets (Interacciones)
- ✅ Lista de targets con posición editable
- ✅ Inputs: halfSize, rotación
- ✅ Botón: mover a jugador
- ✅ Botón: reset from config

### Bocadillo de Diálogo (Speech Bubble)
- ✅ Textarea para editar texto
- ✅ Input: velocidad de lectura (chars/sec)
- ✅ Botón: mostrar bocadillo
- ✅ Botón: ocultar bocadillo

---

## 🚨 Limitaciones Identificadas (Antes de Feature Walls+Openings)

### 1. Editor de Muros: Sin Validación
- ✅ Permite halfSize negativo/cero → puede quebrar pathfinding
- **Fix**: Validar `halfSize > 0.1` antes de guardar

### 2. Falta: Preview de Texturas
- ✅ No hay soporte para ver cómo se vería la textura del muro
- **Fix**: Implementar con SceneWallPlane (próxima feature)

### 3. Editor Genérico: Sin Documentación
- ✅ No hay `docs/components/DebugOverlay.md`
- **Fix**: Documentar después de estabilizar feature de openings

### 4. Falta: Hotkeys
- ✅ Todo es mouse/touch
- **Nice-to-have**: F1=toggle ground, F2=toggle walls, etc.

---

## 📐 Cómo Se Renderiza el Debug

### SceneWalls Component
```typescript
// Cada wall:
<RigidBody type="fixed" position={wall.position} rotation={[0, wall.rotationY, 0]}>
  <CuboidCollider args={wall.halfSize} />           // Colisión real
  {debug && <mesh wireframe />}                      // Visual debug (wireframe)
  {debug && selectedWallIndex === i && <handles />} // Resize handles
</RigidBody>
```

### SceneBackgroundPlane
```typescript
useFrame(({ camera }) => {
  // Sigue cámara a distancia fija
  position = camera.position + direction * distance
  quaternion = camera.quaternion  // Siempre mira a cámara
})
// Renderizado con depthTest=false, depthWrite=false
```

---

## 🔧 Para Agregar Features Nuevas en Debug

**Checklist**:

- [ ] **1. Tipos**: Extensión en `types/gameRuntime.ts` (demo, no core)
- [ ] **2. Store**: Agregar getter/setter en `sceneEditorStore` si es necesario
- [ ] **3. UI**: Nuevo componente en `components/debug/` o extender existente
- [ ] **4. Integración**: Conectar en `DebugOverlayRuntimePanel.tsx`
- [ ] **5. Testing**: Asegurar que cambios NO afecten `sceneStore` (core)
- [ ] **6. Documentación**: Actualizar `docs/DEBUG_MODE_REVIEW.md`

---

## 🎯 Next Steps: Walls with Openings

Ver: `docs/architecture/07-walls-with-openings.md`

**Resumen**:
1. Extender `GameSceneWall` en core con `openings[]` + `textureUrl`
2. Actualizar pathfinding para restar openings de colisiones
3. Crear `SceneWallPlane.tsx` (renderer paralelo a cámara)
4. Extender `WallEditorPanel` para editor de openings + textura

**Objetivo**: Crear puertas/ventanas editables en debug mode, con visualización de textura paralela a background.

---

## 📚 Documentos Relacionados

- `docs/architecture/01-layers.md` — arquitectura general
- `docs/architecture/03-rules-core-vs-render.md` — decisión core vs renderer
- `docs/components/DebugOverlay.md` — (por crear)
- `docs/architecture/07-walls-with-openings.md` — feature en diseño

---

## Changelog

| Fecha | Acción |
|-------|--------|
| 2026-05-27 | Revisión post-refactorización: documentación obsoleta identificada, debug mode funcional |
