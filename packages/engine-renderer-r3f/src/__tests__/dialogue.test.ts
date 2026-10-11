import { describe, expect, test } from "vitest";
import {
  navigateChoices,
  resolveSpeechDismiss,
  shouldHoldBubble,
  shouldShowChoices,
} from "../hooks/dialogueLogic";

describe("shouldHoldBubble", () => {
  test("solo con dialogo activo y opciones", () => {
    expect(shouldHoldBubble(true, 2)).toBe(true);
    expect(shouldHoldBubble(true, 0)).toBe(false);
    expect(shouldHoldBubble(false, 2)).toBe(false);
  });
});

describe("shouldShowChoices", () => {
  const base = { active: true, choiceCount: 2, hasLine: true, typedTrigger: 3, triggerCount: 3 };
  test("aparecen al terminar de escribirse la linea", () => {
    expect(shouldShowChoices(base)).toBe(true);
  });
  test("no aparecen mientras la linea se escribe (otro bocadillo ya terminado)", () => {
    expect(shouldShowChoices({ ...base, typedTrigger: 2 })).toBe(false);
    expect(shouldShowChoices({ ...base, typedTrigger: -1 })).toBe(false);
  });
  test("sin linea salen de inmediato", () => {
    expect(shouldShowChoices({ ...base, hasLine: false, typedTrigger: -1 })).toBe(true);
  });
  test("nunca sin dialogo activo o sin opciones", () => {
    expect(shouldShowChoices({ ...base, active: false })).toBe(false);
    expect(shouldShowChoices({ ...base, choiceCount: 0 })).toBe(false);
  });
});

describe("resolveSpeechDismiss", () => {
  test("avanza con dialogo activo; si no, solo oculta", () => {
    expect(resolveSpeechDismiss(true)).toBe("advance");
    expect(resolveSpeechDismiss(false)).toBe("hide");
  });
});

describe("navigateChoices", () => {
  test("flechas con vuelta", () => {
    expect(navigateChoices("ArrowDown", 2, 3)).toEqual({ kind: "focus", position: 0 });
    expect(navigateChoices("ArrowUp", 0, 3)).toEqual({ kind: "focus", position: 2 });
    expect(navigateChoices("ArrowDown", 0, 3)).toEqual({ kind: "focus", position: 1 });
  });
  test("Inicio y Fin", () => {
    expect(navigateChoices("Home", 2, 4)).toEqual({ kind: "focus", position: 0 });
    expect(navigateChoices("End", 0, 4)).toEqual({ kind: "focus", position: 3 });
  });
  test("Enter y Espacio eligen la actual", () => {
    expect(navigateChoices("Enter", 1, 3)).toEqual({ kind: "choose", position: 1 });
    expect(navigateChoices(" ", 2, 3)).toEqual({ kind: "choose", position: 2 });
  });
  test("numeros 1-9 eligen esa posicion solo si existe", () => {
    expect(navigateChoices("1", 2, 3)).toEqual({ kind: "choose", position: 0 });
    expect(navigateChoices("3", 0, 3)).toEqual({ kind: "choose", position: 2 });
    expect(navigateChoices("4", 0, 3)).toEqual({ kind: "none" });
    expect(navigateChoices("0", 0, 3)).toEqual({ kind: "none" });
  });
  test("lista vacia, tecla ajena y posicion fuera de rango", () => {
    expect(navigateChoices("Enter", 0, 0)).toEqual({ kind: "none" });
    expect(navigateChoices("a", 0, 3)).toEqual({ kind: "none" });
    expect(navigateChoices("Enter", 9, 3)).toEqual({ kind: "choose", position: 2 });
  });
});
