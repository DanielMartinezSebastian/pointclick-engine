# Cómo Crear un Plan Modular

Crear un plan cuando: 2+ semanas, dependencias complejas, refactor significativo.
**No crear plan** para: bug fix, cambio en 1-2 archivos, feature < 1 día.

## Estructura de un plan

```
docs/phases/<nombre-fase>/
├── README.md           # Overview + status + links (~80L)
├── tracking.md         # Solo checkboxes agrupados (~150L)
└── tasks/
    ├── _template.md    # Copia para tareas nuevas
    ├── 01-*.md         # 1 archivo = 1 tarea (~50L)
    ├── 02-*.md
    └── ...
```

## Pasos

### 1. Define el scope (30 min)

Responde en el `README.md` de la fase:

```markdown
# Phase N: <título>

**Objetivo**: <una frase>
**Duración estimada**: N semanas
**Estado**: planning | active | completed
**Owner**: <nombre>

## Por qué
<contexto, 3-5 líneas>

## Resultado esperado
<criterio de éxito verificable>

## Tareas
- [ ] 01-task-a.md
- [ ] 02-task-b.md
- ...
```

### 2. Lista las tareas (1 hora)

Cada tarea debe poder ejecutarse en **2-4 horas máximo**. Si una tarea estima más, divídela.

Numera con prefijo `NN-` para forzar orden lexicográfico.

### 3. Escribe cada tarea (15-30 min cada una)

Copia `tasks/_template.md` y rellena. Una tarea = un archivo ~50L.

**Reglas**:
- Autocontenida: subagente puede ejecutarla sin leer otros docs
- Tiene `Prerequisites`, `Action`, `Success Criteria`, `On Complete`
- Referencia archivos de `architecture/` si hace falta contexto

### 4. Crea el tracking (15 min)

`tracking.md` es **solo checkboxes** agrupados por sprint/semana. Sin descripciones, sin código. Si necesitas detalle, está en el task file.

```markdown
# Phase N: Tracking

## Week 1
- [ ] [01-task-a](tasks/01-task-a.md)
- [ ] [02-task-b](tasks/02-task-b.md)

## Week 2
- [ ] [03-task-c](tasks/03-task-c.md)
```

### 5. Commit inicial

```
docs(phase-N): create modular plan for <tema>

- [x] Marked: phase README created
- [x] Marked: N tasks defined
- [x] Marked: tracking initialized
```

## Tamaños recomendados

| Archivo | Líneas |
|---------|--------|
| `README.md` de fase | 50-100 |
| `tracking.md` | 100-200 |
| Cada task | 30-80 |

Si una tarea pasa de 80 líneas → divide o muévela a un ADR si es decisión arquitectónica.

## Ver también

- `how-to-track-tasks.md` — Marcar checks conforme avanzas
- `how-to-spawn-subagent.md` — Delegar tareas
- Ejemplo real: `docs/phases/phase-2-core-extraction/`
