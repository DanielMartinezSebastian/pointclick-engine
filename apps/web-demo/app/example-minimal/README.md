# example-minimal

Un juego de dos escenas y un ítem que **solo importa de los paquetes**:
`react`, `@pointclick-engine/engine-core` y `@pointclick-engine/engine-renderer-r3f`.
No usa nada de `app/lib`, `app/components`, `app/store` ni `demo-content`.

Es la prueba de que la librería es consumible fuera de la demo.

## Abrirlo

```bash
npm run dev
# http://localhost:3000/example-minimal
```

## Qué hace

- Registra dos escenas y un ítem con `createGameRuntime`.
- Monta `<GameViewport>` con la escena inicial y un trofeo sembrado en el suelo.
- Click sobre el trofeo para recogerlo; camina hacia el fondo (W o click) para
  cruzar a la otra escena.
- El panel de arriba lee el estado de los stores del core.

Sin persistencia, sin audio, sin UI de mochila: son opciones de `GameViewport`.

## Prueba automática

`node e2e/smoke-minimal.mjs` (con el servidor en marcha).
