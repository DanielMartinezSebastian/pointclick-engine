# Task 15.06 — Workflow de CI

**Effort**: 30min | **Modelo**: haiku | **Blocks**: 09 | **Blocked by**: —

**Archivos permitidos** (ningún otro):
- `.github/workflows/ci.yml` (nuevo)

---

## 🎯 Objetivo

El repo no tiene CI. Crear un workflow de GitHub Actions que ejecute en cada push a `main` y en cada pull request las mismas comprobaciones que el gate de la fase.

## Contexto del repo

- Monorepo npm workspaces: `packages/engine-core`, `packages/engine-renderer-r3f`, `apps/web-demo`.
- La demo consume los paquetes por `file:` y resuelve a `dist/`, así que **los paquetes deben compilarse antes** de testear o type-checkear la demo.
- Node 20. Gestor: npm (hay `package-lock.json`).
- No hay tests e2e todavía: no instalar navegadores de Playwright.

## 📝 Instructions

Crear `.github/workflows/ci.yml` con un único job `verify` en `ubuntu-latest`:

1. `actions/checkout@v4`
2. `actions/setup-node@v4` con `node-version: 20` y `cache: npm`
3. `npm ci`
4. Build de paquetes: `npm run build -w packages/engine-core` y luego `npm run build -w packages/engine-renderer-r3f` (en ese orden)
5. `npm test`
6. Type-check, tres pasos separados:
   - `npx tsc --noEmit -p packages/engine-core`
   - `npx tsc --noEmit -p packages/engine-renderer-r3f`
   - `npx tsc --noEmit -p apps/web-demo`
7. `npm run lint`
8. `npm run build -w apps/web-demo`

Requisitos:
- `on: push` (ramas `main`) y `pull_request`.
- `concurrency` por ref con `cancel-in-progress: true`.
- `permissions: contents: read`.
- Cada comprobación en su propio `step` con `name` legible, para ver cuál falla.
- Fijar `env: NEXT_TELEMETRY_DISABLED: 1` a nivel de job.
- Sin secretos, sin pasos de deploy ni de publish.

## ✅ Success Criteria

- [ ] El archivo es YAML válido: `node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/ci.yml','utf8');if(/\t/.test(s))throw new Error('tabs');console.log('ok',s.split('\n').length,'lines')"`.
- [ ] Contiene los 8 pasos en el orden indicado.
- [ ] `git status --short` solo muestra `.github/workflows/ci.yml` como nuevo.

## Reporte

Contenido del archivo. No ejecutes el workflow ni hagas push.
