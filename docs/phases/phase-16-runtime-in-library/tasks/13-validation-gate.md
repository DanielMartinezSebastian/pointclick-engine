# Task 16.13 — Gate de validación y release 0.5.0

**Effort**: 2h | **Modelo**: opus (orquestador) | **Blocks**: fase narrativa | **Blocked by**: todas

---

## 🎯 Objetivo

Validar la fase completa y dejarla lista para publicar. Publicar en npm **no** forma parte de esta tarea: requiere orden explícita del owner.

## 📝 Instructions

### 1. Gate técnico (con `dist/` borrado antes)

```bash
npm run build:packages && npm test && npm run typecheck && npm run lint && npm run build
```

### 2. Fronteras

```bash
grep -rln "demo-content\|apps/web-demo" packages/                 # vacío
grep -rln "demo-content" apps/web-demo/app                        # solo puntos de composición (page.tsx, rutas example-*)
ls apps/web-demo/app/lib/engine/render apps/web-demo/app/lib/core # no existen
```

### 3. Contrato v1

Comparar la lista de exports de `publicApi.ts` con la sección 2.1 de `LIBRARY_API_CONTRACT_V1.md`: ningún nombre ausente.

### 4. Consumo real

```bash
npm pack -w packages/engine-core -w packages/engine-renderer-r3f
```

Instalar los dos `.tgz` en un proyecto Next.js vacío fuera del monorepo (en el directorio temporal de la sesión), copiar `example-minimal/page.tsx` y comprobar que compila y arranca. Es la única prueba que detecta dependencias ocultas del monorepo.

### 5. Smoke en navegador (skill `run-web-demo`)

Demo principal: intro, movimiento por click/teclado, recoger y colocar ítems, puerta con llave, las transiciones de las 3 escenas conectadas, música y SFX, cambio de idioma, persistencia tras recargar, "reiniciar partida" conserva idioma y audio. Además `/example-minimal`, `/example-bridge` y `/debug`.

### 6. Release

- Versión `0.5.0` en ambos `package.json` y en las constantes `VERSION` / `RENDERER_VERSION`.
- CHANGELOG revisado.
- ADR-0009 enlazado desde el issue; cerrar el issue al fusionar.
- Estado de la fase → `completed`; actualizar `docs/README.md` y "Fase activa" en `CLAUDE.md`.

### 7. Retrospectiva de una página en el README de la fase

Qué quedó fuera y pasa a la fase narrativa (mínimo: `inventory:pickup`/`drop`, puertas en core, trocear `GameTouchSpriteRuntime`).

## ✅ Success Criteria

- [ ] Pasos 1–5 sin fallos.
- [ ] Versiones y CHANGELOG coherentes.
- [ ] Ningún check de `tracking.md` marcado sin evidencia.
