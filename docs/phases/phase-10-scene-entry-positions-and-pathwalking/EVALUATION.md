# Evaluación: Entradas Personalizadas y Sistema de Pathwalking

**Fecha**: 2026-05-30 | **Solicitante**: Daniel Martínez Sebastián | **Estado**: Evaluación

---

## 📋 Requerimientos Solicitados

1. **Entrada personalizada en escenas destino**: Poder configurar dónde aparece el jugador al transicionar (ej: por una puerta específica, no spawn por defecto)
2. **Animación de entrada**: El jugador debería caminar de las coordenadas de entrada hasta un punto objetivo en la nueva escena
3. **Sistema de pathwalking general**: Capacidad de programar que el jugador camine de punto A a punto B (futuras integraciones web donde usuario hace click en web y el personaje se desplaza)

---

## 🏗️ Análisis de Arquitectura

### Estado Actual (Phase 8-9)

```typescript
// Transición actual
interface BaseSceneTransition {
  id: string;
  targetSceneId: string;      // ← Solo especifica ESCENA
  position: GameVec3;         // Posición del trigger
  halfSize: GameVec3;
  preTransitionDialogKey?: DialogKey;
  postTransitionDialogKey?: DialogKey;
}

// Lo que FALTA: dónde aparece el jugador en la escena destino
// Actualmente: playerSpawn por defecto
```

### Propuesta de Distribución por Capas

#### **Core (engine-core) — AGNÓSTICO**

**Cambios mínimos, respetuosos con futuro:**

```typescript
// 1. Types
interface BaseSceneTransition {
  // ... existente ...
  entryPosition?: GameVec3;      // ← NUEVO: dónde aparece en escena destino
}

// 2. Nuevo tipo de comando
type GameCommand = 
  | ...existente...
  | { type: "player:walkTo"; position: GameVec3; onReached?: () => void };

// 3. Nuevo tipo de evento
type GameEvent =
  | ...existente...
  | { type: "player:walkStarted"; targetPosition: GameVec3 }
  | { type: "player:walkAborted"; reason: "user-input" | "collision" | "unreachable" }
  | { type: "player:walkCompleted"; position: GameVec3 };

// 4. Estado nuevo en sceneStore
type PlayerWalkingState = {
  targetPosition: GameVec3;
  pathPoints: GameVec3[];      // Ruta pre-calculada (A* o similar)
  progress: number;             // 0-1
  isActive: boolean;
};

// 5. Lógica pura (utilidades)
export function validateEntryPosition(
  position: GameVec3,
  scene: GameScene
): { valid: boolean; reason?: string };  // Verifica no estar dentro de muros

export function validateWalkPath(
  from: GameVec3,
  to: GameVec3,
  scene: GameScene
): { reachable: boolean; path?: GameVec3[] };  // Usa A* existente
```

**Por qué en core:**
- Los datos (entryPosition) deben ser agnósticos a renderer
- La validación de accesibilidad es lógica pura, framework-agnostic
- Otros renderers necesitarán esto (Phaser, Babylon, etc.)

---

#### **Renderer R3F (engine-renderer-r3f) — ESPECÍFICO**

**Nueva funcionalidad de animación:**

```typescript
// 1. Hook de animación
export function usePlayerWalkAnimation(
  playerPosition: GameVec3,
  walkingState: PlayerWalkingState | null
): {
  animatedPosition: GameVec3;
  isWalking: boolean;
  progress: number;
};

// Utiliza useFrame para:
// - Interpolar posición a lo largo de path
// - Detectar colisiones en ruta y abortar si es necesario
// - Permitir que input manual del usuario cancele la caminata

// 2. Integración en GameTouchCanvas/SceneTransitions:
// Cuando transition:completed dispara:
//   if (transitionData.entryPosition) {
//     dispatch("player:walkTo", { position: entryPosition })
//   }

// 3. Visual debug (opcional):
// - Mostrar path calculado en modo debug
// - Marker en entryPosition destino
```

**Por qué en renderer:**
- La animación suave requiere `useFrame` (three.js/rapier específico)
- La interpolación de frames es responsabilidad del renderer
- Otros renderers harían esto diferente (Phaser: `tween`, Babylon: `animation`, etc.)

---

#### **Demo (apps/web-demo) — INTEGRACIONES**

```typescript
// 1. Actualizar definiciones de escenas:
const scenes = {
  dungeon: {
    ...
    transitions: [
      sceneTransitionOnCollision({
        id: "exit-to-town",
        targetSceneId: "town",
        position: [...],
        halfSize: [...],
        entryPosition: [5, 0, 10],  // ← Entra por la puerta de la ciudad
      })
    ]
  }
}

// 2. Hook de integración:
export function useTransitionWithEntry() {
  // Escucha transition:completed
  // Si tiene entryPosition, emite player:walkTo automáticamente
  // Opcionalmente muestra feedback visual
}
```

**Por qué aquí:**
- Configuración específica del juego (dónde están las puertas)
- Integraciones de UI/feedback son demo-específicas

---

## 📊 Tamaño y Complejidad

### Estimación de Esfuerzo

| Componente | Ficheros | LOC delta | Complejidad | Riesgo |
|---|---|---|---|---|
| **Types + validación (core)** | types/index.ts, utils/validation.ts | +150/-0 | 🟡 Media | 🟢 Bajo |
| **State (core)** | state/sceneStore.ts | +80/-0 | 🟢 Baja | 🟢 Bajo |
| **Comandos + eventos (core)** | commands/types.ts, events/types.ts | +50/-0 | 🟢 Baja | 🟢 Bajo |
| **Tests core** | __tests__/playerWalk.test.ts | +250 | 🟡 Media | 🟡 Medio |
| **Hook de animación (R3F)** | src/hooks/usePlayerWalkAnimation.ts | +200/-0 | 🟠 Alta | 🟠 Alto |
| **Integración transiciones (R3F)** | src/scene/SceneTransitions.tsx | +100/-30 | 🟡 Media | 🟡 Medio |
| **Tests R3F** | __tests__/usePlayerWalkAnimation.test.tsx | +180 | 🟠 Alta | 🟡 Medio |
| **Demo: definiciones + UI** | app/demo-content/, app/components/ | +80/-20 | 🟢 Baja | 🟢 Bajo |
| **Docs** | PLAN.md, ADR | +200 | 🟢 Baja | 🟢 Bajo |
| **TOTAL** | ~12 ficheros | **~1290 net** | **🟠 Alta** | **🟡 Medio** |

---

## ⚠️ Riesgos Identificados

### 1. **Input manual durante caminata automática** (ALTO)

**Problema**: ¿Qué pasa si el usuario intenta mover el personaje mientras camina automáticamente?

**Solución propuesta**:
- Input del usuario **siempre gana** (mayor prioridad)
- Automáticamente aborta `player:walkTo`
- Emite `player:walkAborted` con reason "user-input"
- Transición suave a input manual

**Dónde se maneja**: Hook `usePlayerWalkAnimation` en renderer

---

### 2. **Colisiones durante caminata** (ALTO)

**Problema**: Path pre-calculado podría ser inválido en tiempo real (ej: otro objeto bloqueó ruta)

**Solución propuesta**:
- Usar pathfinding existente (A*) al inicio de `player:walkTo`
- Si colisión durante animación: abortar con reason "collision"
- NO recalcular en tiempo real (costoso)
- Emitir evento `player:walkAborted` para que demo reaccione

**Dónde se maneja**: 
- Validación core: `validateWalkPath()`
- Detección en renderer: `usePlayerWalkAnimation()` + colisiones de Rapier

---

### 3. **Accesibilidad de entryPosition** (MEDIO)

**Problema**: entryPosition podría estar dentro de un muro o fuera de terreno válido

**Solución propuesta**:
- Validación en **definición de escena** (editor, datos)
- Función core: `validateEntryPosition(position, scene): { valid, reason }`
- Tests exhaustivos con geometrías complejas

**Dónde se maneja**: 
- Core: `src/game/utils/validation.ts`
- Tests: validar con escenas que tienen muros + openings

---

### 4. **Recalcular vs Pre-calcular ruta** (MEDIO)

**Problema**: A* en cada frame es costoso; pre-calcular asume mundo estático

**Solución**: 
- Pre-calcular ruta **una sola vez** al llamar `player:walkTo`
- Si cambia el mundo (ej: muro agregado), nueva llamada a `player:walkTo` = nuevo cálculo
- Escenario actual (juego estático) está OK; futuro (dinámico) añadir cache/revalidación

---

### 5. **Integración con `setScene`** (BAJO)

**Problema**: Cuando transicionas escena, playerSpawn vs entryPosition

**Solución**:
1. `setScene` pone jugador en `entryPosition` si existe, sino en `playerSpawn`
2. Opcionalmente disparar `player:walkTo` después (configurables ambos)

**Dónde se maneja**: `sceneStore.setScene()` + `useTransitionWithEntry()` hook

---

## 🎯 Dependencias y Blocking

### ¿Bloquea a otros?
- ❌ No. Es extensión pura de Phase 8 (transiciones)

### ¿Bloqueado por algo?
- ✅ Phase 8 (transiciones como primitivas) — COMPLETO
- ✅ Pathfinding existente — YA IMPLEMENTADO
- ✅ Rapier colisiones — YA IMPLEMENTADO

**Resultado**: Sin dependencias externas, ready to build.

---

## 📈 Impacto en Arquitectura

### ✅ Respeta Capas
- Core: solo tipos + lógica pura (sin React, sin R3F)
- Renderer: animación + integración visual
- Demo: configuración específica

### ✅ Agnóstico a Renderer
- Otros renderers (Phaser, Babylon) pueden implementar `usePlayerWalkAnimation` equivalente
- Core types + validación reutilizable en cualquier renderer

### ✅ No Rompe API Pública
- `entryPosition` es **opcional** (backward compatible)
- `player:walkTo` es comando nuevo (no reemplaza nada)
- Escenas sin entryPosition siguen funcionando con `playerSpawn`

### ⚠️ Pequeño Trade-off
- State `PlayerWalkingState` en sceneStore (simple, aceptable)
- Validación requiere acceso a scene geometry (necesario, no evitable)

---

## 🚀 Casos de Uso Desbloqueados

### Inmediato (v0.1.5+)
```typescript
// Transición por puerta específica
sceneTransitionOnCollision({
  id: "exit-to-town-via-south-gate",
  targetSceneId: "town",
  position: [...],
  entryPosition: [3.5, 0, -8],  // Aparece en puerta sur
})

// Seguido de caminata automática → punto de encuentro
// Renderer maneja automáticamente
```

### Futuro (Integraciones Web)
```typescript
// Usuario hace click en web "ir a biblioteca"
// Web emite: { type: "player:walkTo", position: [15, 0, 20] }
// Personaje camina automáticamente allí

// O combinado:
// - Transición escena A → B (aparece en puerta)
// - Camina hasta bibliotecario
// - Dialoga
// - Todo orquestado desde web o engine
```

---

## 🏆 Success Criteria (Phase 10)

- [ ] `entryPosition` agregado a `BaseSceneTransition`
- [ ] Funciones de validación: `validateEntryPosition`, `validateWalkPath`
- [ ] Comando `player:walkTo` implementado
- [ ] Eventos: `player:walkStarted`, `player:walkCompleted`, `player:walkAborted`
- [ ] Hook `usePlayerWalkAnimation` anima suavemente
- [ ] Input manual cancela caminata automática
- [ ] Colisiones abortan caminata automática
- [ ] Integración SceneTransitions usa entryPosition automáticamente
- [ ] Demo: al menos 2 escenas con entryPosition y caminata visible
- [ ] Tests exhaustivos: validación, path-finding, animación, cancelaciones
- [ ] 100% tests passing
- [ ] Backward compatible: escenas sin entryPosition usan playerSpawn

---

## 📚 Documentación Requerida

- `PLAN.md` — Desglose de tareas atómicas (8-10 subtasks)
- `ADR-010-pathwalking.md` — Decisión de arquitectura
- `docs/components/README.md` — API de `player:walkTo` y hooks

---

## ✅ Recomendación Final

**PROCEDE — Alta prioridad, esfuerzo medio-alto, alto ROI**

### Por qué:
1. **Arquitectura clara**: Cambios localizados, respeta capas
2. **Bajo riesgo**: Sin breaking changes, bien contenido
3. **Alto ROI**: Desbloquea caso de uso clave (integraciones web ↔ juego)
4. **Implementable hoy**: No depende de nada externo

### Siguiente paso:
→ Abrir **Phase 10: Scene Entry Positions & Player Pathwalking**  
→ Desglosar en 8-10 tareas atómicas de ~50 LOC cada una  
→ Ejecutar una por una con tests + commits atómicos

---

**Clasificación**: Feature expansion | **Impacto**: Medium-High | **Riesgo**: Medium | **Esfuerzo**: 1000 LOC
