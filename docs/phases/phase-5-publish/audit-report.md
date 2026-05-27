# Pre-publish Audit Report

**Date**: 2026-05-27
**Phase**: 5
**Author**: automated (Task 01)

---

## Workspaces

| Workspace | Path | Type |
|-----------|------|------|
| `@pointclick-engine/engine-core` | `packages/engine-core` | Library (agnostic) |
| `@pointclick-engine/engine-renderer-r3f` | `packages/engine-renderer-r3f` | Library (R3F renderer) |
| `@pointclick-engine/web-demo` | `apps/web-demo` | Next.js demo app |

---

## Package.json state (pre-phase-5)

### engine-core

```json
{
  "exports": { ".": { ... } },   // solo entry point raíz
  "sideEffects": <missing>,       // no declarado
  "dependencies": { "zustand": "^5.0.13" }
  // sin: repository, bugs, homepage, engines, publishConfig
}
```

### engine-renderer-r3f

```json
{
  "exports": { ".": { ... } },   // solo entry point raíz
  "dependencies": {              // three/R3F como dependencies, no peerDependencies
    "@pointclick-engine/engine-core": "*",
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.6.1",
    "@react-three/rapier": "^2.2.0",
    "three": "^0.184.0",
    "zustand": "^5.0.13"
  },
  "peerDependencies": { "react": "...", "react-dom": "..." }
  // falta: three, @react-three/* y zustand en peerDeps
  // sin: repository, bugs, homepage, engines, publishConfig
}
```

---

## Source line counts (aproximados)

- `packages/engine-core/src/`: ~500 líneas TypeScript
- `packages/engine-renderer-r3f/src/`: ~900 líneas TypeScript/TSX

---

## Comandos no cableados (Phase 4 legacy)

Verificados en `apps/web-demo/app/lib/engine/publicApi.ts`:

```
"player:stop"
"inventory:toggle"
"inventory:pickup"
"inventory:drop"
"dialog:trigger"
"dialog:dismiss"
```

→ **Task 02** los cablea o aplaza formalmente.

---

## Demo content acoplado a app

`apps/web-demo/app/{scenes,items,dialogs}` y `app/demo/content/` mezclan
contenido de juego con rutas Next.js. Un consumer no puede distinguir engine vs. demo.

→ **Task 03** mueve todo a `apps/web-demo/demo-content/`.

---

## Subpath exports faltantes

Hoy solo existe `"."` en el exports map de ambos packages.
Un consumer no puede hacer `import { GameCommand } from "@pointclick-engine/engine-core/commands"`.

→ **Task 04** añade 6 subpaths en engine-core y 2 en engine-renderer-r3f.

---

## Sin README / LICENSE / CHANGELOG por package

→ **Task 05** los crea.

---

## Sin verificación de tarball

Ningún `npm pack --dry-run` ha sido ejecutado; los `.d.ts` podrían no estar bien
incluidos según el `files` declarado.

→ **Task 06** valida con dry-run + sandbox.

---

## Sin guía de renderer alternativo

La abstracción de Phase 3 permite renderers alternativos pero no hay documentación.

→ **Task 07** crea `docs/architecture/06-renderer-implementation-guide.md`.

---

## Disponibilidad de scope npm

```
$ npm view @pointclick-engine/engine-core
npm error 404 Not Found — @pointclick-engine/engine-core
```

✅ Scope `@pointclick` libre en npm. Se procede con ese nombre.

---

## Gaps → tasks de resolución

| Gap | Task |
|-----|------|
| Comandos no cableados | 02-wire-pending-commands |
| Demo content acoplado | 03-separate-demo-content |
| Subpath exports faltantes | 04-package-exports-and-metadata |
| Sin README/LICENSE/CHANGELOG | 05-readmes-licenses-changelogs |
| Sin verificación tarball | 06-publish-dry-run |
| Sin guía de renderer | 07-final-docs-and-renderer-guide |

---

## Conclusión

La librería es técnicamente correcta (core agnóstico, renderer abstracto, bus
bidireccional). Los 6 gaps listados arriba bloquean una publicación limpia; todos
tienen task asignada en Phase 5. Scope npm disponible. Scope definitivo: `@pointclick-engine/*`.
