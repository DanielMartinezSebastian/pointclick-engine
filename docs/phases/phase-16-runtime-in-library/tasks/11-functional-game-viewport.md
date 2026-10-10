# Task 16.11 — `GameViewport` funcional

**Effort**: 1–1.5 días (dividir en 11a/11b al empezar) | **Modelo**: sonnet, diseño revisado por opus | **Blocks**: 12, 13 | **Blocked by**: 03, 06, 07, 09

---

## 🎯 Objetivo

Hoy `GameViewport` renderiza `GameCanvasCore`, que es un `<Canvas>` vacío. El juego lo monta `GameTouchCanvas.tsx` (526 líneas) mezclando tres cosas: composición del juego, herramientas de debug/editor y UI propia de la demo. Hay que separar la primera y llevarla al renderer.

## Diseño (a confirmar por el orquestador antes de implementar)

`GameViewport` en `engine-renderer-r3f` compone lo mínimo jugable:

- `<Canvas>` + cámara ortográfica + luces + `<Physics>`
- fondo de escena, `GameTouchSpriteRuntime`, drop targets, ítems colocados, `SceneTransitions`
- cortina de fundido entre escenas
- lee escenas, ítems y diálogos del runtime (`getGameRuntime()`), nunca de `demo-content`

Puntos de extensión por props:

```ts
type GameViewportProps = {
  debug?: boolean;
  onRuntimeEvent?: GameRuntimeEventHandler;     // contrato v1, se conserva
  character?: CharacterDefinition;
  audio?: { port: AudioPort; defaults: AudioDefaultsConfig };
  children?: ReactNode;      // contenido extra dentro de <Physics> (p. ej. SceneDoors de la demo)
  overlay?: ReactNode;       // UI HTML por encima del canvas
  slots?: { inventory?: ComponentType<InventoryRenderProps>; loader?: ComponentType<{ ready: boolean }> };
};
```

Se queda en la demo: paneles de debug y editores, joystick, `InventoryUI`, `SceneDoors` + `useDoorSystem`, efecto CRT, intro.

## 📝 Instructions

1. **11a — Inventario y traslado de hooks**: mover al renderer los hooks de orquestación que no son de editor (`useSceneRuntimeController`, `useInventoryRuntimeController`, `useTransitionSystem`, `useProximityHintController`), sustituyendo cada import de `demo-content` y de `app/store/*` por datos del runtime o por parámetros. Tabla previa obligatoria: hook → dependencias de demo → cómo se inyectan.
2. **11b — Componente**: implementar `GameViewport`, moviendo también `SceneBackgroundPlane`, `SceneCameraControllers`, `SceneDropTargets` y `PlacedSceneItems`.
3. `GameTouchCanvas.tsx` pasa a componer `<GameViewport>` + extras de la demo. Objetivo: < 200 líneas.
4. Nueva ruta `apps/web-demo/app/example-minimal/page.tsx`: un juego de 2 escenas y 1 ítem que **solo** importa de los dos paquetes. Es la prueba de que la librería es consumible.

## ✅ Success Criteria

- [ ] Gate técnico verde.
- [ ] `grep -rln "demo-content" packages/` → vacío.
- [ ] `/example-minimal` arranca y permite moverse, recoger el ítem y cambiar de escena.
- [ ] Demo principal sin regresiones en el smoke completo.
- [ ] `GameViewportProps` conserva `debug` y `onRuntimeEvent`.

## Riesgo

Es la tarea de mayor riesgo de la fase. Si al hacer la tabla del paso 1 algún hook resulta inseparable de los stores de la demo, parar y replantear con el orquestador antes de mover nada.
