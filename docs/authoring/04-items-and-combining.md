# 4. Ítems, reglas de drop y combinaciones

## Ítems

`GameItemConfig` (`packages/engine-core/src/game/runtime/types.ts`):

```ts
export type GameItemConfig = {
  id: string;
  name: string;
  spriteUrl: string;
  descriptionDialogKey?: string;
  pickupSoundUrl?: string;
  dropSoundUrl?: string;
  interactionRules: Record<string, GameItemRule>;
  defaultRule: GameItemRule;
  /** Ramas condicionales para combinar este ítem con otro por id. */
  combine?: Record<string, Branch[]>;
};
```

`interactionRules` (por id de interacción) y `defaultRule` son las **reglas de drop** de 0.5.0: qué pasa al soltar el ítem sobre una diana de arrastre (`GameItemRule.outcome`: `"place"` lo deja en la escena, `"consume"` lo gasta, `"return"` vuelve al inventario; más `hitDialogKey`, `missDialogKey`...). No cambian en 0.6.0. Los ítems que no se sueltan en dianas usan `interactionRules: {}` y `defaultRule: { outcome: "return" }`, como el fixture:

```ts
const item = (id: string, extra: Partial<GameItemConfig> = {}): GameItemConfig => ({
  id,
  name: `item.${id}`,
  spriteUrl: `/${id}.png`,
  interactionRules: {},
  defaultRule: { outcome: "return" },
  ...extra,
});
```

## Combinar dos ítems

La regla se declara en **uno** de los ítems: `combine[idDelOtro]` es una lista de ramas ([02](02-conditions-and-actions.md)). Vale en **ambos sentidos**: `resolveCombine(a, b)` busca primero `a.combine[b.id]` y, si no existe, `b.combine[a.id]`. Del fixture:

```ts
import { act, otherwise, type GameItemConfig } from "@pointclick-engine/engine-core";

const lens: GameItemConfig = item("lens", {
  combine: {
    "lamp-frame": [
      otherwise(
        act.say("combine.lamp"),
        act.removeItem("lens"),
        act.removeItem("lamp-frame"),
        act.giveItem("lamp"),
      ),
    ],
  },
});
```

El guion **decide** el resultado: el comando `inventory:combine` no quita ni da nada por su cuenta, solo corre la rama. Recuerda el orden de [02](02-conditions-and-actions.md): `say` espera al cierre del bocadillo, así que la demo (`demo-content/items/index.ts`) pone `removeItem`/`giveItem` **antes** del `say`.

Comando y eventos:

| | |
|--|--|
| Comando | `inventory:combine` `{ itemId, withItemId }` |
| Éxito | `item:combined` `{ itemId, withItemId }` y se corre el guion |
| Fallo | `item:combineFailed` si son el mismo ítem, falta alguno en el inventario, no está registrado o no hay rama aplicable |

El renderer **no** trae UI de combinar: la UI del inventario es del host. La demo lanza el comando al soltar un ítem sobre otro slot ocupado (`apps/web-demo/app/components/GameTouchCanvas.tsx`) y explica `item:combineFailed` con una frase.

## Usar un ítem sobre un hotspot o NPC

`useItem[itemId]` del hotspot/NPC (ver [01](01-scenes-and-hotspots.md)) y `useItemDefault` para el resto. Solo se ejecuta si el jugador tiene el ítem: si no, `hotspot:noAction` con `reason: "missing-item"`. En el fixture, la llave abre el cofre y cualquier otra cosa cae en `useItemDefault`.

## Ítems iniciales en la escena (`initialItems`)

Se siembran **una vez por escena** al entrar por primera vez; cada uno con un `when` opcional evaluado en ese momento (`SceneInitialItem`, `packages/engine-core/src/game/types/index.ts`):

```ts
export interface SceneInitialItem {
  item: PlacedSceneItem;
  when?: Condition;
}
```

Del fixture (escena `cove`), el pescado solo aparece si ya se pasó por la playa:

```ts
initialItems: [
  { item: placed("fish-on-rocks", "fish", "rocks", "cove"), when: cond.visited("beach") },
],
```

Notas:

- `PlacedSceneItem` (mismo archivo): `id`, `itemId`, `interactionId`, `name`, `spriteUrl`, `worldPosition`, `canPickup`, y opcionales `hasCollision`, `collisionHalfSize`, `pickupSuccessDialogKey`, `pickupBlockedDialogKey`, `sceneId`. Un ítem sin `sceneId` recibe el de la escena que lo siembra.
- El `interactionId` de un ítem colocado es una **etiqueta libre**, no una referencia validada: no tiene que existir en `interactions` (el validador no lo comprueba).
- Una escena sembrada no vuelve a sembrarse al reentrar (se recuerda en `seededSceneIds` del guardado). La demo (`scenes.ts`, `personalRoom`) usa un `when` con `cond.not(cond.itemPlaced("trophy"))` para no duplicar el trofeo.
- Los ítems también se pueden dar y quitar en un guion: `act.giveItem`, `act.removeItem`, `act.placeItem`, `act.removePlacedItem`.

## Recoger y soltar por comando

| Comando | Campos nuevos en 0.6.0 |
|---------|------------------------|
| `inventory:pickup` | `placedItemId?` (el `id` del ítem colocado) |
| `inventory:drop` | `interactionId?` o `hotspotId?` (como mucho uno; `hotspotId` equivale a `hotspot:interact` con `verb: "useItem"`) |

Eventos: recoger emite `item:pickedUp` (desde 0.5.0; no `item:dropped`) o `inventory:pickupFailed` (`reason`: `"not-found" | "blocked" | "full" | "unknown-item"`); un guion emite además `item:removed` e `inventory:full` (inventario lleno al hacer `giveItem`). Estos comandos solo cambian estado: los textos (`hitDialogKey`, `pickup*DialogKey`) los muestra el renderer, y un guion los declara con `say`.
