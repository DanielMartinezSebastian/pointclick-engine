# <ComponentName>

**Type**: `<UI | Renderer | Sprite | Editor>` | **Layer**: `<UI | Renderer>` | **File**: `apps/web-demo/app/components/<path>.tsx`

## Purpose

<1-2 líneas. Qué hace el componente, no cómo.>

## Props

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `propA` | `string` | ✅ | — | Descripción |
| `propB` | `number` | ❌ | `0` | Descripción |

## Dependencies

- `@react-three/fiber` (si Renderer)
- `@pointclick/engine-core` (state, types)
- Otros componentes internos: `<ComponentX>`, `<ComponentY>`

## Events / Callbacks

- `onSomething(payload)`: emitido cuando X ocurre
- `onError(err)`: emitido si Y falla

## State Consumption

```ts
// Lee de store (engine-core)
const sceneId = useSceneStore(s => s.sceneId);
```

## Internal Structure

```
<ComponentName>
├── <ChildA>
├── <ChildB>
│   └── <Grandchild>
└── <ChildC>
```

## Usage

```tsx
<ComponentName
  propA="value"
  propB={42}
  onSomething={(p) => console.log(p)}
/>
```

## Gotchas

- Edge case 1: explicación corta
- Performance: si aplica

## Related

- Task: `docs/phases/phase-X/tasks/NN-*.md` (si hay trabajo activo)
- Architecture: `docs/architecture/<archivo>.md`
- Tested by: `<test file>` (si aplica)
