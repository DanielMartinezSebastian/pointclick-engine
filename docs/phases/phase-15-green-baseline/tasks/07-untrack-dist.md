# Task 15.07 — Sacar `dist/` de git

**Effort**: 45min | **Modelo**: opus (orquestador) | **Blocks**: 09 | **Blocked by**: 01–06, 08 integradas

**Archivos**: `.gitignore`, `package.json` (raíz), `packages/*/package.json`, índice de git.

---

## 🎯 Objetivo

`packages/*/dist/` está versionado (260 archivos) y 9 de ellos no coinciden con lo que genera `src` (`findPath.js`, `GameTouchSpriteRuntime.js`, `useClickToMoveController.js`). `docs/workflow/pre-commit-checklist.md` ya dice que `dist/` no se commitea.

Lo ejecuta el orquestador porque manipula el índice de git y `package.json` raíz, que no deben tocarse en paralelo.

## Riesgo a cubrir

La demo depende de los paquetes por `file:` → `main: dist/index.js`. Sin `dist/` en git, un clon limpio no arranca hasta compilar. Hay que hacerlo automático.

## 📝 Instructions

1. `.gitignore`: añadir `packages/*/dist/`.
2. `git rm -r --cached packages/engine-core/dist packages/engine-renderer-r3f/dist` (los archivos quedan en disco).
3. `package.json` raíz, scripts:
   - `"build:packages": "npm run build -w packages/engine-core && npm run build -w packages/engine-renderer-r3f"`
   - `"prepare": "npm run build:packages"` (se ejecuta tras `npm install` / `npm ci`)
   - `"typecheck": "tsc --noEmit -p packages/engine-core && tsc --noEmit -p packages/engine-renderer-r3f && tsc --noEmit -p apps/web-demo"`
   - `"predev": "npm run build:packages"`
4. En cada `packages/*/package.json`: `"prepublishOnly": "npm run build"`.
5. Simplificar `.github/workflows/ci.yml` para usar `npm run build:packages` y `npm run typecheck`.

## ✅ Success Criteria

- [ ] `git ls-files packages | grep -c "/dist/"` → 0.
- [ ] Borrando ambos `dist/` y ejecutando `npm run build:packages && npm test && npm run build` → todo verde.
- [ ] `npm pack --dry-run -w packages/engine-core` sigue incluyendo `dist/`.
- [ ] `npm run dev` arranca tras borrar `dist/` (lo regenera `predev`).

## On Complete

Marcar `[x]` en tracking. Commit: `chore(phase-15): untrack dist and build packages on install`.
