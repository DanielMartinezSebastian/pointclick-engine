# 5. Guardado, validación y test de recorrido

## Guardado único

Toda la partida vive en **una instantánea** JSON bajo una sola clave (`pointclick-save` por defecto). Tipo real (`packages/engine-core/src/game/state/saveGame.ts`):

```ts
export interface GameSnapshot {
  version: number;
  sceneId: string;
  playerPosition?: GameVec3;
  inventory: InventorySlotsState;
  placedItems: PlacedSceneItem[];
  seededSceneIds: string[];
  flags: Record<string, FlagValue>;
  visitedSceneIds: string[];
  /** Estado propio del host (p. ej. puertas de la demo). Opaco para el core. */
  extra?: Record<string, unknown>;
}
```

Se activa pasando un almacenamiento a `createGameRuntime` (`storage: KeyValueStoragePort`, y opcionalmente `saveKey`). Sin `storage`, los comandos solo avisan por consola.

| Comando | Evento | Qué hace |
|---------|--------|----------|
| `game:save` `{ extra? }` | `game:saved` | Escribe la instantánea (`extra` = estado propio del host) |
| `game:load` | `game:loaded` `{ found, applied?, extra? }` | Lee y restaura; `applied` es `false` si la escena guardada no está registrada |
| `game:reset` | `game:reset` | Vacía inventario, ítems, flags y borra la clave de guardado (no cambia de escena) |

Detalles que importan:

- Orden al restaurar: inventario, ítems colocados, flags, y **al final** la escena, para que lo que se evalúe al entrar vea el estado ya restaurado (`applySnapshot`).
- `loadGame` nunca lanza: devuelve `null` si no hay partida, el JSON es inválido, la forma no cuadra o la versión es superior a `SAVE_FORMAT_VERSION` (hoy 1).
- Para cambiar el formato: sube `SAVE_FORMAT_VERSION` y añade la entrada a `SAVE_MIGRATIONS` (`{ [versionOrigen]: migración }`).
- `playerPosition` es opcional: sin ella, la escena usa su `playerSpawn`.
- Una partida de 0.5.0 (cuatro claves sueltas: `inventory-slots`, `current-scene-id`, `placed-items-state`...) se convierte con `migrateLegacySave(storage, { defaultSceneId, legacySeededSceneId?, extraKeys? })`, que **no** borra las claves antiguas ni escribe la nueva: eso lo decides tú. La demo lo hace en `apps/web-demo/app/lib/gamePersistence.ts`, que además guarda sus puertas en `extra`.

## Validación del contenido

`validateContent(content)` recorre escenas, ítems y diálogos y devuelve una lista de incidencias (`ContentIssue`: `severity`, `code`, `where`, `message`). Con `createGameRuntime` corre sola, según la opción `validate`:

| `validate` | Efecto |
|------------|--------|
| (sin valor) | Como `true` solo cuando `NODE_ENV === "development"`; nada en test o producción |
| `true` | Un único `console.warn` agrupado |
| `"throw"` | Lanza si hay errores (los avisos van a consola) |
| `false` | No valida |

Para que compruebe las claves de texto y los `call`, pasa `dialogKeys` (conjunto de claves conocidas) y `handlerNames` (nombres de manejadores) en la config del runtime. En `GameContent`, que recibe `validateContent` directamente, se llaman `dialogKeys` y `handlers`.

Códigos (`packages/engine-core/src/game/narrative/validate*.ts`):

| Severidad | Códigos |
|-----------|---------|
| error | `duplicate-id`, `unknown-item`, `unknown-scene`, `unknown-interaction`, `unknown-dialogue`, `unknown-dialogue-start`, `unknown-dialogue-node`, `dialogue-dead-end`, `unknown-verb`, `unknown-action`, `unknown-branch`, `unknown-condition` |
| warning | `unknown-dialog-key`, `unknown-handler`, `unreachable-scene`, `unreachable-dialogue-node`, `unused-item`, `flag-never-set`, `flag-never-read` |

El `interactionId` de un ítem colocado no se valida (es una etiqueta libre).

## Test de recorrido headless

`createPlaythrough` monta el runtime real con reloj virtual (`HeadlessClock`), almacenamiento en memoria y caminata instantánea, **sin renderer**. Se importa del subpath `@pointclick-engine/engine-core/testing`. Valida el contenido y lanza si hay errores. Hay **una sola partida viva por proceso** (los registros son globales): llama a `dispose()` al terminar cada test.

Sin renderer, `createPlaythrough` aplica por su cuenta las reglas declarativas que en el juego aplica el renderer (`initialItems`, `onEnter`, `when`/`blocked`). Del test `miniAdventure.playthrough.test.ts`:

```ts
import { createPlaythrough, type Playthrough } from "@pointclick-engine/engine-core/testing";
import { miniAdventure } from "./fixtures/miniAdventure";

const p = createPlaythrough(miniAdventure, {
  handlers: { credits: (args) => void credits.push(args) },
  onRuntime: (rt) =>
    void rt.on("dialog:triggered", (e) => {
      if (e.dialogKey) said.push(e.dialogKey);
    }),
});
await p.settle();

// Puzzle 1: recoger y usar.
await p.pickUp("key-on-sand");
await p.useItemOn("rusty-key", "chest");
expect(p.state().inventory).toEqual(["lens"]);
expect(p.state().flags["chest.open"]).toBe(true);

// Puzzle 2: conversacion condicionada por haber mirado el mapa.
await p.look("map");
await p.talk("fisherman");
await p.choose(0);
await p.choose(2);

// Puzzle 3: combinar; luego cambio de escena.
await p.combine("lens", "lamp-frame");
await p.goThrough("to-cove");
```

API de `Playthrough` (`packages/engine-core/src/testing/playthrough.ts`):

| Método | Qué hace |
|--------|----------|
| `look(id)`, `use(id)`, `talk(id)` | Verbo sobre el hotspot o NPC `id`; `talk` se detiene en la primera elección pendiente |
| `useItemOn(itemId, id)` | Usa un ítem del inventario sobre el hotspot o NPC |
| `combine(a, b)` | Combina dos ítems del inventario |
| `pickUp(placedItemId)` | Recoge un ítem colocado de la escena activa |
| `choose(index)` | Elige por **índice original** de `node.choices`; lanza si no está disponible ("no disponible") |
| `goThrough(transitionId)` | Cruza una transición respetando `when`/`blocked` |
| `settle()` | Avanza el reloj y cierra bocadillos hasta que no queden guiones |
| `state()` | `{ sceneId, inventory, flags, dialogueActive }` |
| `save()` | `GameSnapshot`; pásalo como `opts.snapshot` para reanudar |

Opciones de `createPlaythrough`: `initialSceneId`, `handlers` (se registran antes de entrar en la escena inicial), `onRuntime` (antes de entrar, para suscribirse a eventos del arranque) y `snapshot`.

Escribe también los recorridos "equivocados" (usar la llave sin tenerla, hablar antes de mirar el mapa, cruzar una transición bloqueada): el fixture los cubre en el mismo archivo.
