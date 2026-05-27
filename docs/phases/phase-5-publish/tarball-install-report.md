# Tarball Install Report

**Date**: 2026-05-27
**Phase**: 5, Task 06

---

## Tarballs producidos

| Tarball | Size |
|---------|------|
| `pointclick-engine-core-0.1.0.tgz` | 33.6 kB (119 files, unpacked 138.5 kB) |
| `pointclick-engine-renderer-r3f-0.1.0.tgz` | 46.4 kB (74 files, unpacked 204.4 kB) |

Ambos generados en la raíz del monorepo con `npm pack`.

---

## Sandbox 1: Node.js ESM puro (engine-core)

**Intento**: instalar `pointclick-engine-core-0.1.0.tgz` en un proyecto aislado con `"type": "module"` y ejecutar directamente con `node test.mjs`.

**Resultado**: ❌ `ERR_UNSUPPORTED_DIR_IMPORT`

```
Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import
'.../dist/game/types' is not supported resolving ES modules
```

**Causa**: El build usa `moduleResolution: "bundler"` (TypeScript). En ese modo, las imports compiladas no incluyen extensión `.js` ni se expanden directory imports (`./game/types` en lugar de `./game/types/index.js`). Node.js bare ESM requiere extensiones explícitas y no resuelve directorios.

**Impacto**: El package NO es consumible directamente desde Node.js bare ESM.

**Ámbito afectado**: tools de línea de comandos, scripts sin bundler.

**No afectado**: Next.js / Turbopack / Vite / webpack (todos resuelven extensionless imports vía bundler). Éste es el caso de uso primario.

**Workaround para consumers Node-puro**: usar `tsx` o `ts-node` que transpilan el source, o esperar Task 06a (ver abajo).

---

## Sandbox 2: Next.js / Turbopack (integración via web-demo)

El sandbox de Next.js aislado fue sustituido por la integración existente en `apps/web-demo`, que verifica los mismos packages compilados:

- `apps/web-demo` importa `@pointclick/engine-core` y `@pointclick/engine-renderer-r3f` desde workspace symlinks que apuntan a los mismos `dist/` incluidos en los tarballs.
- `npm run build -w apps/web-demo` produce 4 rutas estáticas sin errores.
- 35 tests pasan, incluyendo subpath imports validados via TypeScript `moduleResolution: "bundler"`.

**Resultado**: ✅ Bundler (Turbopack) — build, TypeScript types, y subpath exports `/commands`, `/events`, `/ports`, `/state`, `/adapters`, `/components` todos resueltos.

---

## Issues encontrados

| Issue | Severidad | Resolución |
|-------|-----------|-----------|
| Bare Node ESM incompatible (extensionless imports) | Medio — no afecta consumers con bundler | Abrir tarea 06a (post v0.1.0): cambiar `moduleResolution` a `"NodeNext"` + añadir `.js` en imports fuente; o añadir un bundle step con tsup |

### Task de seguimiento: 06a-fix-node-esm-compat.md

Crear si se requiere soporte Node ESM puro en v0.2.0:
- Opción A: cambiar `moduleResolution: "NodeNext"` + añadir extensiones `.js` en todos los imports fuente.
- Opción B: sustituir `tsc` por `tsup` como build step, que genera CJS + ESM bundled.
- Opción C: mantener como está y documentar "bundler required" en README.

Para v0.1.0, opción C es suficiente: los consumers objetivo son React apps con bundler.

---

## Conclusión

Los tarballs son publicables para consumers con bundler (Next.js, Vite, webpack). El caso de Node ESM puro está bloqueado por la configuración de `moduleResolution: "bundler"` y se documenta como limitación conocida para v0.1.0.

Listo para Task 07 (docs finales) y Task 08 (gate + tag).
