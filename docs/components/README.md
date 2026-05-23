# Components — Demo R3F

Documentación por componente. **Un archivo por componente.** Útil para subagentes que tocan UI/Renderer sin necesitar contexto completo.

## Cuándo crear doc de componente

Crea doc si el componente:
- ✅ Es público / reutilizable (Props son contrato)
- ✅ Tiene lógica no obvia
- ✅ Es candidato a moverse al renderer-r3f (Fase 3)
- ✅ Ha causado bugs o confusión

**No documentes** componentes triviales (wrappers de 5 líneas).

## Componentes actuales

Pendiente documentar (crear conforme se tocan):

### Renderer (R3F)
- [ ] `GameTouchCanvas` — Canvas + Physics + Camera setup
- [ ] `GameTouchSpriteRuntime` — useFrame loop principal
- [ ] `DavidSprite` — Sprite del personaje con animaciones
- [ ] `SceneBackgroundPlane` — Fondo 2.5D
- [ ] `SceneWalls` — Muros con colisión
- [ ] `SceneGround` — Suelo
- [ ] `SceneCameraControllers` — Cámara ortográfica
- [ ] `SceneCollisionSphere` — Esfera de colisión del player
- [ ] `PlacedSceneItems` — Items en la escena

### UI (React, fuera del Canvas)
- [ ] `InventoryUI` — Overlay HTML del inventario
- [ ] `Joystick` — Touch input con nipplejs
- [ ] `SpeechBubble` — Burbuja de diálogo
- [ ] `DebugOverlayPanel` — Panel de debug
- [ ] `PixelSelect` — Selector pixel-art
- [ ] `WallEditorPanel` — Editor de muros (debug)
- [ ] `GroundEditorPanel` — Editor de suelo (debug)

### Sprite system
- [ ] `AnimatedSprite` — Reproductor de atlas

## Cómo documentar un componente

1. Copia `_template.md` a `<ComponentName>.md`
2. Rellena props, eventos, deps, internal structure
3. Mantén bajo 50 líneas

## Para subagentes

Cuando una task toque un componente:
- Lee SOLO `docs/components/<ComponentName>.md`
- + el código del componente
- No necesitas leer otros componentes
