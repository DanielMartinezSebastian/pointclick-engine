// Items de la aventura. Iconos en /assets/adventure/items/<id>.png (packs CC0).
//
// Dos combinaciones, declaradas en un solo item (valen en ambos sentidos):
//   empty-mug  + coffee-beans -> coffee
//   null-pointer + sticky-note -> valid-pointer
// `say` espera al cierre del bocadillo, asi que el resultado va antes que la frase.
import { act, otherwise, type GameItemConfig } from "@pointclick-engine/engine-core";

const item = (id: string, extra: Partial<GameItemConfig> = {}): GameItemConfig => ({
  id,
  name: `item.${id}`,
  spriteUrl: `/assets/adventure/items/${id}.png`,
  descriptionDialogKey: `item.${id}.description`,
  interactionRules: {},
  defaultRule: { outcome: "return" },
  ...extra,
});

export const adventureItems: GameItemConfig[] = [
  item("duck-beak"),
  item("semicolon"),
  item("sticky-note"),
  item("empty-mug", {
    combine: {
      "coffee-beans": [
        otherwise(
          act.removeItem("empty-mug"),
          act.removeItem("coffee-beans"),
          act.giveItem("coffee"),
          act.say("combine.coffee"),
        ),
      ],
    },
  }),
  item("coffee-beans"),
  item("coffee"),
  item("null-pointer", {
    combine: {
      "sticky-note": [
        otherwise(
          act.removeItem("null-pointer"),
          act.removeItem("sticky-note"),
          act.giveItem("valid-pointer"),
          act.say("combine.valid-pointer"),
        ),
      ],
    },
  }),
  item("valid-pointer"),
  item("break"),
  item("bucket"),
];
