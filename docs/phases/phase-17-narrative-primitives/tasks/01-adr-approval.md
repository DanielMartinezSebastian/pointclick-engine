# Task 17.01 — ADR-0010: visto bueno

**Effort**: 30min | **Modelo**: opus (orquestador) | **Blocks**: todas | **Blocked by**: owner

## 🎯 Objetivo

Confirmar con el owner el modelo de [ADR-0010](../../../decisions/0010-declarative-narrative-model.md) antes de escribir código. Puntos a confirmar:

1. Contenido narrativo como datos serializables, con `call` como única vía de escape.
2. Vocabulario inicial de condiciones y acciones (lista en el ADR).
3. Hotspots y NPCs como campos nuevos de la escena (`hotspots`, `npcs`), sin tocar `interactions`.
4. Guardado en una sola clave versionada, con migración desde las cuatro claves de 0.5.0.
5. Versión objetivo 0.6.0, todo aditivo.

## ✅ Success Criteria

- [ ] ADR en estado `accepted`, con los cambios que pida el owner incorporados.
- [ ] Si algún punto cambia el contrato v1 (no debería), issue abierto según `CLAUDE.md`.
