# Task 15.04 — Lint: `any` e imports sin usar

**Effort**: 45min | **Modelo**: haiku | **Blocks**: 09 | **Blocked by**: —

**Archivos permitidos** (ningún otro):
- `apps/web-demo/app/lib/engine/runtime/useTransitionSystem.ts`
- `apps/web-demo/app/lib/platform-web-audio.test.ts`
- `apps/web-demo/app/lib/platform-web-audio.ts`
- `apps/web-demo/app/page.tsx`

---

## 🎯 Objetivo

Quitar 4 errores y 3 warnings de ESLint puramente mecánicos. Cero cambios de comportamiento.

## Lista exacta

| Archivo:línea | Problema | Arreglo |
|---|---|---|
| `useTransitionSystem.ts:9` | `getRandomPhrase` importado y no usado | quitar del import |
| `useTransitionSystem.ts:174` | `any` | sustituir por el tipo real (lee el contexto; probablemente `RuntimeEvent` de `@pointclick-engine/engine-core`) |
| `useTransitionSystem.ts:177` | `any` | ídem |
| `platform-web-audio.test.ts:45` | `any` | tipar el mock con `unknown` + estrechamiento, o con una interfaz mínima local |
| `platform-web-audio.test.ts:58` | `any` | ídem |
| `platform-web-audio.ts:257` | `timeout` asignado y no usado | si el valor no se necesita, no asignarlo; **si es un `setTimeout` que debería limpiarse, no lo toques y repórtalo** |
| `page.tsx:3` | `useMemo` importado y no usado | quitar del import |

## 📝 Instructions

1. Abrir cada archivo en la línea indicada y leer ±20 líneas de contexto.
2. Aplicar el arreglo de la tabla. No usar `eslint-disable`. No usar `as any` ni `as unknown as X` salvo que ya existiera.
3. Si un `any` no se puede tipar sin cambiar otros archivos, déjalo y repórtalo.
4. No reformatear, no renombrar, no "mejorar" nada más.

## ✅ Success Criteria

- [ ] `cd apps/web-demo && npx eslint app/lib/engine/runtime/useTransitionSystem.ts app/lib/platform-web-audio.test.ts app/lib/platform-web-audio.ts app/page.tsx` → 0 errores y 0 warnings.
- [ ] `cd apps/web-demo && npx vitest run app/lib/platform-web-audio.test.ts` → todo pasa.
- [ ] `npx tsc --noEmit -p apps/web-demo` no añade errores en estos 4 archivos.
- [ ] `git diff --stat` solo muestra los 4 archivos permitidos.

## Reporte

Diff resumido por archivo y salida de los comandos. Lista de lo que no pudiste arreglar y por qué.
