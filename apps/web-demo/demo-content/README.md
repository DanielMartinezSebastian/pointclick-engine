# demo-content

Game-specific data for the `web-demo` application.

This folder is **not** part of the engine packages (`engine-core`, `engine-renderer-r3f`).
It holds all the demo's authored content: scenes, items, and dialog lines.

## Structure

```
demo-content/
├── dialogs/
│   ├── types.ts         — Locale, DialogKey, DialogEntry, DialogLocales
│   ├── index.ts         — All dialog phrases (es / en)
│   └── getRandomPhrase.ts — Helper to pick a random phrase by key
├── items/
│   ├── types.ts         — ItemDefinition, ItemInteractionRule, ItemDropOutcome
│   └── index.ts         — ITEMS registry, getItemDefinition, resolveItemRule
├── scenes/
│   └── scenes.ts        — SCENES registry, SceneWall, SceneInteraction, Scene types
└── index.ts             — Barrel re-export
```

## Usage

```ts
import { SCENES, DEFAULT_SCENE_ID } from "@/demo-content/scenes/scenes";
import { getRandomPhrase } from "@/demo-content/dialogs/getRandomPhrase";
import { resolveItemRule } from "@/demo-content/items";
```

Or via the barrel:

```ts
import { SCENES, getRandomPhrase, resolveItemRule } from "@/demo-content";
```

## Adding new content

- **New scene**: add an entry to `SCENES` in `scenes/scenes.ts`.
- **New item**: add an entry to `ITEMS` in `items/index.ts` and add its dialog keys in `dialogs/index.ts`.
- **New dialog lines**: add the key to `dialogs/types.ts` (`DialogKey` union) and add phrases for every locale in `dialogs/index.ts`.
