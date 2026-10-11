import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";

const controllerSpy = vi.fn();
const viewSpy = vi.fn();

vi.mock("../viewport/useGameViewportController", () => ({
  useGameViewportController: (options: unknown) => {
    controllerSpy(options);
    return { debug: true, marker: "controller" };
  },
}));
vi.mock("../viewport/GameViewportView", () => ({
  GameViewportView: (props: unknown) => {
    viewSpy(props);
    return null;
  },
}));

import { GameViewport } from "../viewport/GameViewport";

describe("GameViewport", () => {
  it("pasa debug y onRuntimeEvent al controlador y la vista recibe el controlador", () => {
    const onRuntimeEvent = () => {};
    renderToString(createElement(GameViewport, { debug: true, onRuntimeEvent }));

    expect(controllerSpy).toHaveBeenCalledOnce();
    const options = controllerSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(options.debug).toBe(true);
    expect(options.onRuntimeEvent).toBe(onRuntimeEvent);

    expect(viewSpy).toHaveBeenCalledOnce();
    const viewProps = viewSpy.mock.calls[0][0] as Record<string, unknown>;
    expect(viewProps.controller).toEqual({ debug: true, marker: "controller" });
    expect(viewProps.debug).toBe(true);
  });

  it("sin props funciona con los valores por defecto", () => {
    controllerSpy.mockClear();
    viewSpy.mockClear();
    renderToString(createElement(GameViewport, {}));
    expect(controllerSpy).toHaveBeenCalledOnce();
    expect(viewSpy).toHaveBeenCalledOnce();
  });
});
