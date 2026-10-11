# Task 16.09 — `CharacterSprite` configurable

**Effort**: 3h | **Modelo**: sonnet | **Blocks**: 11 | **Blocked by**: 05

**Archivos permitidos**:
- `packages/engine-renderer-r3f/src/sprite/**`
- `packages/engine-renderer-r3f/src/GameTouchSpriteRuntime.tsx` (solo el uso del sprite y una prop nueva)
- `packages/engine-renderer-r3f/src/index.ts`, `src/components/index.ts`
- `apps/web-demo/demo-content/characters/david.ts` (nuevo)
- `apps/web-demo/app/components/GameTouchCanvas.tsx` (solo pasar la prop nueva)

---

## 🎯 Objetivo

El paquete publicado lleva un personaje concreto dentro: `sprite/DavidSprite.tsx` y `sprite/clips.ts` con la ruta `/assets/sprites/david` fija, y `GameTouchSpriteRuntime` lo instancia directamente. Un consumidor no puede usar su propio personaje, y sin esto no habrá NPCs.

## Diseño

```ts
export interface CharacterClip { frames: string[]; fps: number; loop?: boolean; mirror?: boolean }
export interface CharacterDefinition {
  id: string;
  clips: Record<"idle" | "north" | "south" | "west" | "east", CharacterClip>;
  speaking?: CharacterClip;
  /** Tamaño en unidades de mundo y ancla; valores actuales de David como default. */
  size?: [number, number];
}
```

- `CharacterSprite` = el `DavidSprite` actual, recibiendo `character: CharacterDefinition` en vez de leer constantes del módulo.
- `GameTouchSpriteRuntime` gana la prop `character?: CharacterDefinition`.
- La definición de David se muda a `apps/web-demo/demo-content/characters/david.ts`.

## 📝 Instructions

1. Leer `DavidSprite.tsx`, `clips.ts`, `speakingAnimation.ts` y cómo los usa `GameTouchSpriteRuntime.tsx`. Ajustar el diseño de arriba a los campos que el código necesita de verdad (fps, espejado, orden de frames).
2. Implementar `CharacterSprite` y su handle (`CharacterSpriteHandle`).
3. **Compatibilidad**: `DavidSprite`, `DavidSpriteHandle` y lo que hoy exporta `clips.ts` siguen exportándose, marcados `@deprecated`, implementados sobre `CharacterSprite` con la definición de David embebida como default. Si `character` no se pasa, el runtime se comporta exactamente como hoy.
4. La demo pasa `character={DAVID}` explícitamente.
5. Tests: construcción de URLs de frames a partir de una definición, y selección de clip por dirección.

## ✅ Success Criteria

- [ ] `npm run build:packages && npm test && npm run typecheck` → verdes.
- [ ] `DavidSprite` sigue siendo importable desde el paquete.
- [ ] Un test instancia la lógica de clips con un personaje distinto de David.

## Reporte

Forma final de `CharacterDefinition`, y qué mirar en navegador: animación en las 4 direcciones, idle, y boca al hablar.
