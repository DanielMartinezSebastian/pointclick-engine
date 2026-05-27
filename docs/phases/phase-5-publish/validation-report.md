# Phase 5 Validation Report

**Date**: 2026-05-27
**Branch**: main
**Commit**: HEAD (after Task 08 lint fixes)

---

## 1. Agnosticidad engine-core

Grep para React / R3F / Three.js / browser globals en `packages/engine-core/src/`:

| Check | Result |
|-------|--------|
| `import.*react` | ✅ 0 matches |
| `@react-three` | ✅ 0 matches |
| `from 'three'` | ✅ 0 matches |
| `window.` / `document.` | ✅ 0 matches |

**Conclusión**: engine-core es 100% framework-agnostic.

---

## 2. Build / Test / Lint

| Check | Result |
|-------|--------|
| `npm run build` (full monorepo) | ✅ 4 rutas estáticas, TypeScript OK |
| `npm run test` | ✅ 35/35 tests pass (3 test files) |
| `npm run lint` | ✅ 0 errors, 0 warnings |

---

## 3. Comandos cableados

Ejecutores en `publicApi.ts`:

| Command | Estado |
|---------|--------|
| `scene:set` | ✅ wired |
| `scene:respawn` | ✅ wired |
| `inventory:toggle` | ✅ wired → `inventoryStore.toggle()` |
| `dialog:trigger` | ✅ wired → `dialogStore.show()` + emits `dialog:triggered` |
| `dialog:dismiss` | ✅ wired → `dialogStore.dismiss()` + emits `dialog:dismissed` |
| `player:stop` | ⏸ formalmente aplazado v0.2.0 (requiere DI en renderer) |
| `inventory:pickup` | ⏸ formalmente aplazado v0.2.0 (requiere extracción de state machine) |
| `inventory:drop` | ⏸ formalmente aplazado v0.2.0 (mismo motivo) |

Aplazados documentados en `tasks/02-wire-pending-commands.md` sección "Aplazados".

---

## 4. Packaging

| Check | Result |
|-------|--------|
| `npm pack --dry-run` engine-core | ✅ README, LICENSE, CHANGELOG, dist/, src/ — no tsconfig/tests |
| `npm pack --dry-run` renderer-r3f | ✅ README, LICENSE, CHANGELOG, dist/, src/ — no tsconfig/tests |
| engine-core tarball size | 33.6 kB (119 files, 138.5 kB unpacked) |
| renderer-r3f tarball size | 46.4 kB (74 files, 204.4 kB unpacked) |

---

## 5. Subpath exports

| Package | Subpath | dist file exists |
|---------|---------|-----------------|
| engine-core | `/commands` | ✅ `dist/game/commands/index.js` |
| engine-core | `/events` | ✅ `dist/game/events/index.js` |
| engine-core | `/ports` | ✅ `dist/ports/index.js` |
| engine-core | `/types` | ✅ `dist/game/types/index.js` |
| engine-core | `/state` | ✅ `dist/game/state/index.js` |
| renderer-r3f | `/adapters` | ✅ `dist/adapters/index.js` |
| renderer-r3f | `/components` | ✅ `dist/components/index.js` |

---

## 6. Docs

| Doc | Status |
|-----|--------|
| `packages/engine-core/README.md` | ✅ |
| `packages/engine-renderer-r3f/README.md` | ✅ |
| `packages/engine-core/LICENSE` | ✅ MIT |
| `packages/engine-renderer-r3f/LICENSE` | ✅ MIT |
| `packages/engine-core/CHANGELOG.md` | ✅ entry [0.1.0] |
| `packages/engine-renderer-r3f/CHANGELOG.md` | ✅ entry [0.1.0] |
| `docs/architecture/06-renderer-implementation-guide.md` | ✅ |
| `docs/LIBRARY_CONSUMPTION_GUIDE.md` | ✅ v2 (post Phase 4+5) |
| `docs/workflow/how-to-release.md` | ✅ |
| Root `README.md` | ✅ rewritten |

---

## 7. Known limitations (non-blocking for v0.1.0)

| Issue | Impact | Plan |
|-------|--------|------|
| Bare Node.js ESM incompatible (`ERR_UNSUPPORTED_DIR_IMPORT`) | Consumers without a bundler cannot use the packages directly | v0.2.0: switch to `moduleResolution: "NodeNext"` or add a tsup build step |
| `player:stop`, `inventory:pickup`, `inventory:drop` deferred | Those commands log a warning when called | v0.2.0: requires renderer-side DI |

---

## 8. Release

| Step | Status |
|------|--------|
| Tag `v0.1.0` created | ✅ |
| `npm publish` | ⏸ deferred to owner decision (scope `@pointclick` requires org creation on npmjs.com) |

---

## Conclusión

**Phase 5 COMPLETED**. Engine publishable as `@pointclick/engine-core@0.1.0` and `@pointclick/engine-renderer-r3f@0.1.0`. All gate criteria met. Ready for `npm publish` when the `@pointclick` npm organization is created by the owner.
