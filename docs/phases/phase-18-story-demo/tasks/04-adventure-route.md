# Task 18.04 — Ruta `/adventure` jugable

**Modelo**: sonnet | **Blocks**: 05 | **Blocked by**: 03

**Archivos permitidos**: `apps/web-demo/app/adventure/**` (nuevo), `apps/web-demo/adventure-content/**` (posiciones y textos), `e2e/smoke-adventure.mjs` (nuevo), script `smoke` de `package.json` raíz (añadir el nuevo smoke), `apps/web-demo/public/assets/adventure/**`. Ningún archivo de `packages/`: si falta algo, se reporta.

## 🎯 Objetivo

Que la aventura se juegue en el navegador de principio a fin, sin tocar `/`.

## 📝 Instructions

1. Página cliente que compone `GameViewport`/`useGameViewportController` con `ADVENTURE_CONTENT`, como hace `/example-minimal`, más la mochila y lo que haga falta de `app/components/` (`InventoryUI` con combinación al soltar sobre otro slot).
2. Partida propia: un `storage` que antepone un prefijo a las claves, para no compartir progreso con `/`. Guardado automático y botón de nueva partida.
3. Textos: registra los diccionarios de la aventura y resuelve las claves de `say` como hace la demo (`dialogAdapter`).
4. Intro breve, pantalla final con créditos al dispararse el manejador `credits` (incluye las atribuciones de `public/assets/LICENSES-art.md`).
5. Geometría: coloca hotspots, NPCs e ítems sobre cada fondo y verifícalo con capturas de Playwright, mirándolas. Cada hotspot debe caer sobre el objeto que nombra.
6. `e2e/smoke-adventure.mjs`: recorre el camino principal de la intro a los créditos comprobando la partida guardada tras cada puzzle. Puede acelerar los bocadillos si existe una forma limpia; si no, que espere.

## ✅ Success Criteria

- [ ] Gate técnico verde; `npm run smoke` verde, incluido el nuevo.
- [ ] Capturas de las cinco escenas con sus elementos en su sitio.
- [ ] `/` no cambia: su smoke sigue en 69/69.
