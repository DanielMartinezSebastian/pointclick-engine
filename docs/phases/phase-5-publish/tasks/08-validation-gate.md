# Task 08: Validation gate + tag v0.1.0

**Phase**: 5 | **Estimate**: 2h | **Owner**: —

## Context

Última task de Phase 5. Validar criterios de publish-readiness, taguear `v0.1.0` y (opcionalmente) ejecutar `npm publish`. La publicación real es decisión del owner: el gate prepara todo para que el `npm publish` sea un comando trivial cuando se quiera ejecutar.

## Prerequisites

- [ ] Tasks 01-07 done (todas marcadas `[x]` en tracking.md)
- [ ] Branch limpio, último commit pushed
- [ ] Cuenta npm con permisos sobre `@pointclick` (o el scope decidido en ADR-0007)
- [ ] 2FA configurado en npm si la org lo requiere

## Action

Guardar resultados en `docs/phases/phase-5-publish/validation-report.md`.

### 1. Regresión-check de agnosticidad (final)

```bash
echo "=== Agnosticidad final engine-core ===" > /tmp/gate5.txt
grep -rn "import.*react\|from ['\"]react" packages/engine-core/src/ >> /tmp/gate5.txt 2>&1 || echo "✅ react clean" >> /tmp/gate5.txt
grep -rn "@react-three" packages/engine-core/src/ >> /tmp/gate5.txt 2>&1 || echo "✅ r3f clean" >> /tmp/gate5.txt
grep -rn "from ['\"]three" packages/engine-core/src/ >> /tmp/gate5.txt 2>&1 || echo "✅ three clean" >> /tmp/gate5.txt
grep -rn "\bwindow\.\|\bdocument\." packages/engine-core/src/ >> /tmp/gate5.txt 2>&1 || echo "✅ browser-globals clean" >> /tmp/gate5.txt
cat /tmp/gate5.txt
```

**Esperado**: 4 `✅`.

### 2. Build + test + lint completo

```bash
npm run build
npm run test
npm run lint
```

**Esperado**: todo verde en los 3 workspaces.

### 3. Verificar comandos cableados

```bash
grep -n "executor not yet wired\|executor not wired" apps/web-demo/app/lib/engine/publicApi.ts
```

**Esperado**: 0 resultados, o solo los formalmente aplazados a v0.2.0 (documentados en Task 02 sección "Aplazados").

### 4. Demo funcional (smoke final)

```bash
npm run dev
```

Manual en `http://localhost:3000`:

- [ ] Golden path principal
- [ ] `/example-bridge`: comandos disparan, eventos llegan

### 5. Re-empaquetado limpio

```bash
npm run build -w packages/engine-core
npm run build -w packages/engine-renderer-r3f

npm pack -w packages/engine-core --dry-run
npm pack -w packages/engine-renderer-r3f --dry-run
```

Verificar que las listas incluyen `README.md`, `LICENSE`, `CHANGELOG.md`, `dist/`, `src/`. Sin `__tests__/`, sin `tsconfig.json`.

### 6. Documentar proceso de release

Crear `docs/workflow/how-to-release.md`:

```markdown
# How to Release

## Pre-release checklist

- [ ] `main` branch is up to date
- [ ] All tests pass: `npm run test`
- [ ] All linters pass: `npm run lint`
- [ ] Demo functional: `npm run dev` + manual smoke
- [ ] CHANGELOG entries written for the new version
- [ ] No `WIP` or `TODO` left in `publicApi.ts`

## Release a new version (v0.x.x)

\`\`\`bash
# 1. Bump versions (lockstep)
npm version 0.1.0 --workspace packages/engine-core --no-git-tag-version
npm version 0.1.0 --workspace packages/engine-renderer-r3f --no-git-tag-version

# 2. Update CHANGELOG entries: replace [Unreleased] with [0.1.0] — YYYY-MM-DD

# 3. Commit and tag
git add -A
git commit -m "chore(release): v0.1.0"
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin main --tags

# 4. Build fresh
npm run build

# 5. Publish (requires npm login)
npm publish --workspace packages/engine-core --access public
npm publish --workspace packages/engine-renderer-r3f --access public
\`\`\`

## Rollback

If a published version is broken:

\`\`\`bash
npm deprecate @pointclick-engine/engine-core@0.1.0 "broken: use 0.1.1"
\`\`\`

Do **not** `npm unpublish` (npm deletes registry history after 72h; deprecation is preferred).
\`\`\`

### 7. Taguear v0.1.0

Solo el tag, **no el publish real** (a menos que se haya confirmado):

```bash
git tag -a v0.1.0 -m "Phase 5 closed: v0.1.0 publishable"
```

No `git push --tags` automático: dejar al owner decidir.

### 8. (Opcional) `npm publish`

Si owner ha decidido publicar en este momento:

```bash
npm login   # interactivo, requiere 2FA
npm publish --workspace packages/engine-core --access public
npm publish --workspace packages/engine-renderer-r3f --access public
```

Verificar:

```bash
npm view @pointclick-engine/engine-core@0.1.0
npm view @pointclick-engine/engine-renderer-r3f@0.1.0
```

**Esperado**: ambos packages aparecen con la metadata correcta.

Si el publish falla por OTP (one-time password), reintentarlo con `--otp=123456`.

### 9. Crear validation-report.md

```markdown
# Phase 5 Validation Report

Date: <fecha>

## Agnosticidad engine-core
- React/R3F/Three/browser globals: ✅ clean

## Build / Test / Lint
- `npm run build`: ✅
- `npm run test`: ✅ (N tests pass)
- `npm run lint`: ✅

## API completeness
- Comandos cableados: 9/9 (o N/9 con aplazados documentados)
- Eventos emitidos: cubren las 8 acciones

## Packaging
- `npm pack --dry-run` engine-core: ✅
- `npm pack --dry-run` engine-renderer-r3f: ✅
- Tarball sandbox install (Task 06): ✅

## Docs
- README per package: ✅
- LICENSE per package: ✅
- CHANGELOG per package: ✅
- Renderer implementation guide: ✅
- Release workflow doc: ✅

## Release
- Tag v0.1.0 creado: ✅
- npm publish: <ejecutado | omitido por decisión del owner>

## Conclusión
Phase 5 COMPLETED. Engine publicable. v0.1.0 listo.
```

## Success Criteria

- [ ] Todos los chequeos del gate pasan
- [ ] `validation-report.md` creado
- [ ] `tracking.md` de Phase 5 al 100% (`8/8` tareas `[x]`)
- [ ] `README.md` de Phase 5 actualizado a `Estado: completed`
- [ ] `docs/workflow/how-to-release.md` existe
- [ ] Tag `v0.1.0` creado localmente
- [ ] Si se publicó: `npm view @pointclick-engine/engine-core@0.1.0` resuelve
- [ ] Memoria de usuario actualizada (`phase5-progress.md`)

## On Complete

1. Marca `[x]` en `../tracking.md` para `08-validation-gate`
2. Actualiza status en `../README.md`: `Estado: completed`
3. Actualiza `docs/README.md` para marcar Phase 5 como `✅ Completed`
4. Commit:
   ```
   chore(phase-5): pass validation gate, close phase, tag v0.1.0

   Phase 5 (publish) completed.
   - packages publishable: README, LICENSE, CHANGELOG, exports
   - demo-content/ isolated from app code
   - all GameCommand executors wired (or formally deferred)
   - docs: renderer guide + release workflow

   - [x] Marked: 08-validation-gate

   See docs/phases/phase-5-publish/validation-report.md
   ```
5. **No** crear `docs/phases/phase-6-*/`. El motor pasa a mantenimiento.

## References

- ADR-0007: release strategy
- `docs/workflow/how-to-release.md` (creado en esta task)
- Phases anteriores (referencias de estilo de gate)

## Notes

**Decisión owner-only**: ejecutar `npm publish` real o no. Esta task deja todo listo para que sea un comando trivial cuando se quiera. No publicar sin que el owner confirme.

**Tag formato**: `v0.1.0` (con `v` prefix) por convención semver. Verificar que tags previos siguen el mismo formato; si hay inconsistencia, decidir y documentar.

**Si npm publish falla con E403**: el scope `@pointclick` puede requerir creación previa como org en npmjs.com. Crear org en web UI, luego `npm publish --access public`.

**Post-publish**: añadir badges al README raíz (`![npm version](...)` etc.) en una task post-fase si interesa.

**Memoria**: tras cerrar la fase, crear/actualizar memoria del usuario:
- `phase5-progress.md`: ✅ COMPLETED <fecha>: v0.1.0 publicable, X comandos cableados, Y aplazados a v0.2.0
