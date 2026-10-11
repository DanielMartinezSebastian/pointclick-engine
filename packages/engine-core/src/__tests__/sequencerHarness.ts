import { vi } from "vitest";
import { EventBus } from "../events";
import {
  createGameRuntime,
  getInputLockState,
  getInventoryState,
  getPlacedItemsState,
  getWorldState,
  useDialogStore,
  useInputLockStore,
  useSceneStore,
  type GameEvent,
  type GameEventType,
  type GameItemConfig,
  type GameRuntime,
  type GameSceneConfig,
} from "../index";
import { HeadlessClock } from "../ports/headlessClock";

/** Avanza microtareas (no hay tiempo real: solo cola de promesas). */
export async function flush(times = 40): Promise<void> {
  for (let i = 0; i < times; i++) await Promise.resolve();
}

export function makeScene(id: string, extra: Partial<GameSceneConfig> = {}): GameSceneConfig {
  return {
    id,
    label: `Scene ${id}`,
    background: "/bg.png",
    playerSpawn: [1, 0, 1],
    ground: { minX: -5, maxX: 5, minZ: -5, maxZ: 5, y: 0 },
    walls: [],
    interactions: [],
    ...extra,
  };
}

export function makeItem(id: string): GameItemConfig {
  return {
    id,
    name: `Name ${id}`,
    spriteUrl: `/${id}.png`,
    interactionRules: {},
    defaultRule: { outcome: "return" },
  };
}

export function resetStores(): void {
  useDialogStore.setState({ text: "", key: undefined, speaker: undefined, visible: false, triggerCount: 0 });
  useInputLockStore.setState({ inputLocked: false });
  getInventoryState().reset();
  getPlacedItemsState().reset();
  getWorldState().reset();
  useSceneStore.setState({ sceneId: "", playerWalkingState: null });
}

export interface Harness {
  rt: GameRuntime;
  clock: HeadlessClock;
  events: GameEvent[];
}

/** Crea un runtime headless con escena "seq-a" activa y registra los eventos pedidos. */
export function setup(
  opts: { instantWalk?: boolean; record?: GameEventType[] } = {},
): Harness {
  const clock = new HeadlessClock();
  const rt = createGameRuntime({
    scenes: [
      makeScene("seq-a"),
      makeScene("seq-b", { playerSpawn: [-1, 0, -1] }),
      // Un bloque con colision cubre todo el suelo: ningun destino es alcanzable.
      makeScene("seq-blocked", {
        interactions: [
          { id: "blocker", position: [0, 0, 0], halfSize: [20, 1, 20], hasCollision: true },
        ] as unknown as GameSceneConfig["interactions"],
      }),
    ],
    items: [makeItem("seq-key"), makeItem("seq-coin")],
    clock,
    instantWalk: opts.instantWalk ?? true,
  });
  rt.executeCommand({ type: "scene:set", sceneId: "seq-a" });
  const events: GameEvent[] = [];
  for (const type of opts.record ?? []) rt.on(type, (e) => events.push(e as GameEvent));
  return { rt, clock, events };
}

export function dismissDialog(rt: GameRuntime): void {
  rt.executeCommand({ type: "dialog:dismiss" });
}

/** Cuenta suscripciones activas del EventBus (de cualquier instancia). */
export function trackBusSubscriptions(): { active: () => number } {
  let active = 0;
  const original = EventBus.prototype.on;
  vi.spyOn(EventBus.prototype, "on").mockImplementation(function (
    this: EventBus,
    event: string,
    handler: (data: never) => void,
  ) {
    const off = original.call(this, event, handler as (data: unknown) => void);
    active++;
    let released = false;
    return () => {
      if (!released) {
        released = true;
        active--;
      }
      off();
    };
  });
  return { active: () => active };
}

export { getInputLockState };
