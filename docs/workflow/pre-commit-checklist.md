# Pre-Commit Checklist

Validar antes de cada commit que toque código (no aplica a docs-only commits).

## Universal (todo commit)

- [ ] El commit es atómico (1 cambio lógico, no mezcla refactor + feature + fix)
- [ ] Mensaje sigue `commit-convention.md`
- [ ] No archivos sensibles (`.env`, credenciales)
- [ ] No archivos generados (`dist/`, `.next/`) — verificar `.gitignore`

## Si tocas CORE (`packages/engine-core/` o equivalente)

- [ ] `npm run test -w packages/engine-core` pasa
- [ ] `npm run lint` OK
- [ ] **Cero imports de React/R3F/Next.js**: `grep -r "import.*react\|@react-three\|next" packages/engine-core/src/` debe estar vacío
- [ ] No accede a `window`/`document` directamente (usa Port)
- [ ] Types públicos no cambiaron (si lo hicieron: issue + bump semver)

## Si tocas RENDERER (R3F)

- [ ] `npm run dev` levanta sin errores en consola
- [ ] Probado en navegador (golden path: cambiar escena, mover, recoger ítem)
- [ ] `npm run build` sin errores
- [ ] Props del componente tienen TypeScript types claros
- [ ] Eventos hacia core via callbacks/store (no acoplado directo)

## Si tocas UI (componentes React)

- [ ] Sin lógica de juego dentro del componente
- [ ] Lee state de store, no de prop drilling profundo
- [ ] Probado visualmente en navegador
- [ ] Responsive verificado (al menos mobile + desktop)

## Si tocas PLATFORM (adapters)

- [ ] Maneja SSR (`typeof window === 'undefined'` check)
- [ ] Fallback graceful si la API del navegador no existe
- [ ] No mezcla lógica de juego

## Si tocas la API pública (`publicApi.ts`)

- [ ] Issue abierto explicando por qué
- [ ] Migration path documentado (si breaking)
- [ ] Bump semver propuesto
- [ ] `LIBRARY_API_CONTRACT_V1.md` actualizado

## Si marcaste checks en tracking

- [ ] `tracking.md` actualizado con `[x]`
- [ ] Success Criteria de la(s) task(s) marcada(s) realmente validados
- [ ] Commit message referencia el task file (`See docs/phases/.../tasks/NN-*.md`)

## Comando rápido de validación

```bash
# Desde raíz
npm run lint && npm run test && npm run build
```

Si todo pasa: commit. Si falla: fix antes de commit, no `--no-verify`.
