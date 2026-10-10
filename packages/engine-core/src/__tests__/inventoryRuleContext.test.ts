import { describe, it, expect, vi, afterEach } from "vitest";
import {
  createInventoryRuleContext,
  resolveInventoryDropHitDecision,
  resolvePickupPlacedItemDecision,
  type GameItemConfig,
  type GameItemRule,
} from "../index";

function makeItem(extra: Partial<GameItemConfig> = {}): GameItemConfig {
  return {
    id: "key",
    name: "Llave",
    spriteUrl: "/key.png",
    descriptionDialogKey: "item.key.description",
    pickupSoundUrl: "/pick.ogg",
    interactionRules: {
      door: { outcome: "consume", hitDialogKey: "item.key.door.hit" },
      pedestal: { outcome: "place", placeCanPickup: true },
    },
    defaultRule: { outcome: "return", missDialogKey: "item.key.default.miss" },
    ...extra,
  };
}

const interaction = { id: "door", position: [0, 0, 0], halfSize: [1, 1, 1] } as never;
const payload = { stack: { id: "key", name: "Llave", spriteUrl: "/key.png" }, fromSlotIndex: 3 };

afterEach(() => vi.restoreAllMocks());

describe("createInventoryRuleContext", () => {
  it("resuelve definicion y reglas desde un registro", () => {
    const ctx = createInventoryRuleContext({ key: makeItem() });
    const def = ctx.getItemDefinition("key");
    expect(def).toMatchObject({ id: "key", name: "Llave", descriptionDialogKey: "item.key.description", pickupSoundUrl: "/pick.ogg" });
    expect(ctx.resolveItemRule("key", "door")?.outcome).toBe("consume");
    expect(ctx.resolveItemRule("key", "pedestal")).toMatchObject({ outcome: "place", placeCanPickup: true });
  });

  it("usa defaultRule si no hay regla para la interaccion", () => {
    const ctx = createInventoryRuleContext({ key: makeItem() });
    expect(ctx.resolveItemRule("key", "otra")).toEqual({ outcome: "return", missDialogKey: "item.key.default.miss" });
  });

  it("item desconocido devuelve null en ambas funciones (y no cae al prototipo)", () => {
    const ctx = createInventoryRuleContext({ key: makeItem() });
    expect(ctx.getItemDefinition("nope")).toBeNull();
    expect(ctx.resolveItemRule("nope", "door")).toBeNull();
    expect(ctx.getItemDefinition("toString")).toBeNull();
    expect(ctx.resolveItemRule("key", "constructor")?.outcome).toBe("return");
  });

  it("con funcion lee el registro en cada uso, no al crear el contexto", () => {
    let registry: Record<string, GameItemConfig> = {};
    const ctx = createInventoryRuleContext(() => registry);
    expect(ctx.getItemDefinition("key")).toBeNull();
    registry = { key: makeItem() };
    expect(ctx.getItemDefinition("key")?.id).toBe("key");
    registry = {};
    expect(ctx.resolveItemRule("key", "door")).toBeNull();
  });

  it("encaja con las reglas de inventario (drop consume, pickup)", () => {
    const ctx = createInventoryRuleContext({ key: makeItem() });
    expect(resolveInventoryDropHitDecision(ctx, { interaction, payload, now: 1 })).toMatchObject({
      kind: "consume",
      fromSlotIndex: 3,
      dialogKey: "item.key.door.hit",
    });
    const unknown = { ...payload, stack: { ...payload.stack, id: "zzz" } };
    expect(resolveInventoryDropHitDecision(ctx, { interaction, payload: unknown, now: 1 }).kind).toBe("unknown-item");
    expect(
      resolvePickupPlacedItemDecision(ctx, {
        placedItem: { id: "p1", itemId: "key", canPickup: true } as never,
      }).kind,
    ).toBe("allow");
  });

  it("regla especifica con outcome invalido: resolveItemRule null y el drop es rule-miss (no consume ni coloca)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const bad = { outcome: "pickup-success" } as GameItemRule;
    const ctx = createInventoryRuleContext({
      key: makeItem({ interactionRules: { door: bad } }),
    });
    expect(ctx.resolveItemRule("key", "door")).toBeNull();
    expect(resolveInventoryDropHitDecision(ctx, { interaction, payload, now: 1 }).kind).toBe("rule-miss");
    expect(ctx.getItemDefinition("key")?.interactionRules).toEqual({});
    expect(warn).toHaveBeenCalled();
  });

  it("outcome fuera del tipo (valor desconocido en runtime) tambien se rechaza", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const bad = { outcome: "banana" } as unknown as GameItemRule;
    const ctx = createInventoryRuleContext({ key: makeItem({ interactionRules: { door: bad } }) });
    expect(ctx.resolveItemRule("key", "door")).toBeNull();
  });

  it("defaultRule invalida: resolveItemRule null; la definicion usa un return seguro con missDialogKey", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const ctx = createInventoryRuleContext({
      key: makeItem({ defaultRule: { outcome: "rule-miss", missDialogKey: "m.k" } }),
    });
    expect(ctx.resolveItemRule("key", "otra")).toBeNull();
    expect(ctx.getItemDefinition("key")?.defaultRule).toEqual({ outcome: "return", missDialogKey: "m.k" });
    // las reglas validas siguen funcionando
    expect(ctx.resolveItemRule("key", "door")?.outcome).toBe("consume");
  });

  it("avisa una sola vez por regla invalida", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const ctx = createInventoryRuleContext({
      key: makeItem({ interactionRules: { door: { outcome: "rule-miss" } } }),
    });
    ctx.resolveItemRule("key", "door");
    ctx.resolveItemRule("key", "door");
    ctx.getItemDefinition("key");
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
