import { describe, it, expect } from "vitest";
import { legacyRuntimeEventToGameEvent } from "../game/events/legacyAdapter";

describe("legacyRuntimeEventToGameEvent: recogida", () => {
  it("onDrop pickup-success se emite como item:pickedUp", () => {
    const ge = legacyRuntimeEventToGameEvent({
      type: "onDrop",
      outcome: "pickup-success",
      itemId: "gameboy",
      interactionId: "slot-1",
    });
    expect(ge).toEqual({ type: "item:pickedUp", itemId: "gameboy", quantity: 1 });
  });

  it.each(["place", "return", "consume", "rule-miss", "pickup-blocked"])(
    "onDrop %s sigue siendo item:dropped",
    (outcome) => {
      const ge = legacyRuntimeEventToGameEvent({
        type: "onDrop",
        outcome,
        itemId: "gameboy",
      });
      expect(ge.type).toBe("item:dropped");
      if (ge.type === "item:dropped") expect(ge.outcome).toBe(outcome);
    },
  );
});
