import {
  getDeclaredScene,
  getPlacedItemsState,
  getSceneRuleContext,
  resolveInitialItems,
  type PlacedSceneItem,
} from "@pointclick-engine/engine-core";

/**
 * Callback de siembra por escena. Devuelve los items a anadir (puede ser `[]`:
 * la escena se marca sembrada sin anadir nada) o `null` para indicar que la
 * escena no se siembra y NO debe marcarse como sembrada. Un item devuelto sin
 * `sceneId` se asigna a la escena que se esta sembrando.
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
 * Siembra los items iniciales de una escena una sola vez. Idempotente. Devuelve true si marco la escena.
 * Orden: primero `scene.initialItems` (declarativo, evaluado contra el estado previo a la
 * siembra); despues `getInitialPlacedItems`, que ve ya los items declarativos y anade los suyos.
 * Sin ninguno de los dos, o con la escena ya sembrada, no hace nada. Si la escena declara
 * `initialItems` se marca sembrada aunque el callback devuelva `null`.
 */
export function seedSceneItems(
  sceneId: string,
  getInitialPlacedItems: GetInitialPlacedItems | undefined,
  state: SeedStore = getPlacedItemsState(),
): boolean {
  const declared = getDeclaredScene(sceneId)?.initialItems;
  if (!getInitialPlacedItems && !Array.isArray(declared)) return false;
  if (state.isSceneSeeded(sceneId)) return false;
  const fromScene = resolveInitialItems(sceneId, declared, getSceneRuleContext(sceneId, state.items));
  const base = fromScene ? [...state.items, ...fromScene] : state.items;
  const fromCallback = getInitialPlacedItems?.(sceneId, base) ?? null;
  if (fromScene === null && fromCallback === null) return false;
  const owned = (fromCallback ?? []).map((item) =>
    item.sceneId === undefined ? { ...item, sceneId } : item,
  );
  const added = [...(fromScene ?? []), ...owned];
  if (added.length > 0) state.setItems([...state.items, ...added]);
  state.markSceneSeeded(sceneId);
  return true;
}
