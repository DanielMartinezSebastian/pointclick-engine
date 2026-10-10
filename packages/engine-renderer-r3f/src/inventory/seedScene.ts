import { getPlacedItemsState, type PlacedSceneItem } from "@pointclick-engine/engine-core";

/**
 * Callback de siembra por escena. Devuelve los items a anadir (puede ser `[]`:
 * la escena se marca sembrada sin anadir nada) o `null` para indicar que la
 * escena no se siembra y NO debe marcarse como sembrada.
 */
export type GetInitialPlacedItems = (
  sceneId: string,
  allItems: PlacedSceneItem[],
) => PlacedSceneItem[] | null;

/** Subconjunto del store de items colocados que usa la siembra. */
export type SeedStore = Pick<
  ReturnType<typeof getPlacedItemsState>,
  "items" | "setItems" | "markSceneSeeded" | "isSceneSeeded"
>;

/**
 * Siembra los items iniciales de una escena una sola vez. Sin callback, o con
 * la escena ya sembrada, no hace nada. Idempotente. Devuelve true si marco la escena.
 */
export function seedSceneItems(
  sceneId: string,
  getInitialPlacedItems: GetInitialPlacedItems | undefined,
  state: SeedStore = getPlacedItemsState(),
): boolean {
  if (!getInitialPlacedItems) return false;
  if (state.isSceneSeeded(sceneId)) return false;
  const added = getInitialPlacedItems(sceneId, state.items);
  if (added === null) return false;
  if (added.length > 0) state.setItems([...state.items, ...added]);
  state.markSceneSeeded(sceneId);
  return true;
}
