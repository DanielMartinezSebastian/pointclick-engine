// Smoke headless de la demo: juega un recorrido corto y comprueba estado y audio.
// Uso: node e2e/smoke.mjs [baseUrl]   (requiere el servidor de la demo en marcha)
// Sale con código 1 si alguna comprobación falla.
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
// Coordenadas para viewport 1280x720 en la escena personalRoom.
const POS = { trophy: [846, 575], doorstep: [570, 455], introTap: [640, 600], backpack: [82, 640], gameboyPad: [763, 566], emptyFloor: [420, 640], confirmReset: [779, 423], dungeonGate: [615, 330], computer: [270, 315], guide: [397, 470], keyBit: [601, 598] };
// El bocadillo se cierra solo tras escribir el texto y un tiempo de lectura;
// mientras está visible no se puede recoger ni interactuar.
const DIALOG_MS = 10000;

const checks = [];
const check = (name, ok, detail = "") => {
  checks.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
// Registra cada reproducción de audio (el oído lo pone el test).
await context.addInitScript(() => {
  window.__plays = [];
  const original = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function play() {
    window.__plays.push(String(this.currentSrc || this.src).split("/").pop());
    return original.call(this).catch(() => {});
  };
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
page.on("response", (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url().slice(0, 120)}`); });

// La partida vive en una sola instantánea (`pointclick-save`); las puertas van en `extra.doors`.
const SAVE_KEY = "pointclick-save";
const LEGACY_KEYS = ["inventory-slots", "current-scene-id", "placed-items-state", "door-states"];
const state = () => page.evaluate(([saveKey, legacyKeys]) => {
  const parse = (k) => { try { return JSON.parse(localStorage.getItem(k) ?? "null"); } catch { return null; } };
  const save = parse(saveKey);
  return {
    scene: save?.sceneId ?? null,
    inventory: (save?.inventory ?? []).filter(Boolean).map((s) => s.id),
    placed: (save?.placedItems ?? []).map((i) => `${i.itemId}@${i.sceneId}`),
    doors: save?.extra?.doors ?? {},
    version: save?.version ?? null,
    seeded: save?.seededSceneIds ?? [],
    flags: save?.flags ?? {},
    legacyLeft: legacyKeys.filter((k) => localStorage.getItem(k) !== null),
    plays: window.__plays.slice(),
  };
}, [SAVE_KEY, LEGACY_KEYS]);
const waitFor = async (predicate, timeoutMs) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const s = await state();
    if (predicate(s)) return s;
    await page.waitForTimeout(500);
  }
  return state();
};
const enterGame = async () => {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.mouse.click(...POS.introTap);
  await page.waitForTimeout(800);
  await page.mouse.click(...POS.introTap);
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /continu/i }).first().click();
  return page
    .waitForFunction(() => document.querySelector("canvas") && !document.querySelector('[aria-label="Cargando…"]'), null, { timeout: 40000 })
    .then(() => true, () => false);
};
// Abre la mochila y arrastra el ítem cuyo slot contiene `label` hasta `target`.
const dragFromInventory = async (label, target) => {
  await page.mouse.click(...POS.backpack);
  await page.waitForTimeout(1200);
  const box = await page.getByRole("button", { name: label }).first().boundingBox();
  if (!box) return false;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(target[0], target[1], { steps: 25 });
  await page.waitForTimeout(400);
  await page.mouse.up();
  return true;
};
// Arrastra el ítem del slot `from` y lo suelta sobre el slot `to` (combinar). Devuelve false si falta alguno.
const dragSlotOntoSlot = async (from, to) => {
  await page.mouse.click(...POS.backpack);
  await page.waitForTimeout(1200);
  const a = await page.getByRole("button", { name: from }).first().boundingBox();
  const b = await page.getByRole("button", { name: to }).first().boundingBox();
  if (!a || !b) return false;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 20 });
  await page.waitForTimeout(400);
  await page.mouse.up();
  return true;
};
// Partida en el formato de la instantánea nueva (versión 1), inyectada antes de cargar la página.
const injectSave = (overrides) => page.evaluate(([saveKey, o]) => {
  const slots = Array.from({ length: 9 }, () => null);
  (o.items ?? []).forEach((it, i) => { slots[i] = { id: it.id, name: it.name, spriteUrl: it.spriteUrl, quantity: 1 }; });
  localStorage.setItem(saveKey, JSON.stringify({
    version: 1, sceneId: o.sceneId, playerPosition: [0, 0, 0], inventory: slots, placedItems: [],
    seededSceneIds: ["personalRoom"], flags: {}, visitedSceneIds: ["personalRoom"], extra: { doors: {} },
  }));
}, [SAVE_KEY, overrides]);
const GAMEBOY = { id: "gameboy", name: "Gameboy", spriteUrl: "/assets/gameboy/gameboy.png" };
const TROPHY = { id: "trophy", name: "Trophy", spriteUrl: "/assets/trophy/trophy.png" };
const optionTexts = () => page.locator('[role="option"]').allTextContents();
const waitForOptions = (timeoutMs) => page.waitForSelector('[role="listbox"]', { timeout: timeoutMs }).then(() => true, () => false);
const count = (plays, name) => plays.filter((p) => p.includes(name)).length;
const music = (plays) => plays.filter((p) => !p.startsWith("speak") && !p.startsWith("click")).join(",");
// Camina hasta el umbral de la puerta central y empuja hacia el norte: la
// transición es una zona de colisión, no un click sobre la puerta.
const walkThroughCenterDoor = async () => {
  await page.mouse.click(...POS.doorstep);
  await page.waitForTimeout(5000);
  await page.keyboard.down("w");
  await page.waitForTimeout(2500);
  await page.keyboard.up("w");
};

try {
  // 1. Primera visita.
  check("la partida nueva pasa la pantalla de carga", await enterGame());
  await page.waitForTimeout(3000);
  let s = await state();
  check("arranca en personalRoom", s.scene === "personalRoom", `scene=${s.scene}`);
  check("inventario inicial: gameboy y llave", s.inventory.join() === "gameboy,gold-key", s.inventory.join());
  check("el trofeo está sembrado en la habitación", s.placed.includes("trophy@personalRoom"), s.placed.join());
  check("suena la música inicial una sola vez", count(s.plays, "personal-room-loop") === 1, `audio=${music(s.plays)}`);

  // 2. No se puede salir sin el trofeo.
  await walkThroughCenterDoor();
  await page.waitForTimeout(2000);
  s = await state();
  check("la puerta no deja salir sin el trofeo", s.scene === "personalRoom", `scene=${s.scene}`);
  check("no suena la transición al quedar bloqueado", count(s.plays, "transition-default") === 0);
  await page.waitForTimeout(DIALOG_MS);

  // 3. Recoger el trofeo.
  await page.mouse.click(...POS.trophy);
  s = await waitFor((x) => x.inventory.includes("trophy"), 15000);
  check("recoger el trofeo lo mete en el inventario", s.inventory.includes("trophy"), s.inventory.join());
  check("el trofeo deja de estar colocado", !s.placed.some((p) => p.startsWith("trophy@")), s.placed.join());
  check("suena el sonido de recoger", count(s.plays, "pickup-default") === 1, `audio=${music(s.plays)}`);
  check("no suena el sonido de soltar al recoger", count(s.plays, "drop-default") === 0);
  await page.waitForTimeout(DIALOG_MS);

  // 4. Colocar, recoger y devolver ítems arrastrando desde la mochila.
  check("el gameboy se puede arrastrar desde la mochila", await dragFromInventory(/Gameboy/i, POS.gameboyPad));
  s = await waitFor((x) => x.placed.includes("gameboy@personalRoom"), 8000);
  check("soltar el gameboy en su sitio lo coloca", s.placed.includes("gameboy@personalRoom"), s.placed.join());
  check("el gameboy sale del inventario", !s.inventory.includes("gameboy"), s.inventory.join());
  check("colocar suena una vez", count(s.plays, "drop-default") === 1, `audio=${music(s.plays)}`);
  await page.waitForTimeout(DIALOG_MS);

  await page.mouse.click(...POS.gameboyPad);
  s = await waitFor((x) => x.inventory.includes("gameboy"), 15000);
  check("recoger el gameboy colocado lo devuelve al inventario", s.inventory.includes("gameboy"), s.inventory.join());
  check("el gameboy tiene su propio sonido de recogida", count(s.plays, "pickup-gameboy") === 1, `audio=${music(s.plays)}`);
  await page.waitForTimeout(DIALOG_MS);

  const dropsBefore = count(s.plays, "drop-default");
  await dragFromInventory(/Llave/i, POS.emptyFloor);
  await page.waitForTimeout(3000);
  s = await state();
  check("soltar la llave fuera de su diana la devuelve", s.inventory.includes("gold-key"), s.inventory.join());
  check("la llave no queda colocada en la escena", !s.placed.some((p) => p.startsWith("gold-key@")), s.placed.join());
  check("devolver un ítem no suena", count(s.plays, "drop-default") === dropsBefore, `audio=${music(s.plays)}`);
  await page.waitForTimeout(DIALOG_MS);

  // 5. Transición a la mazmorra.
  await walkThroughCenterDoor();
  s = await waitFor((x) => x.scene === "dungeon", 15000);
  check("la puerta central lleva a la mazmorra", s.scene === "dungeon", `scene=${s.scene}`);
  await page.waitForTimeout(2500);
  s = await state();
  check("suena la transición", count(s.plays, "transition-default") >= 1, `audio=${music(s.plays)}`);
  check("cambia la música a la de la mazmorra", count(s.plays, "dungeon-loop") >= 1);

  // 6. Abrir la verja de la mazmorra con la llave.
  await page.waitForTimeout(7000); // el personaje entra caminando
  const dropsBeforeKey = count(s.plays, "drop-default");
  await dragFromInventory(/Llave/i, POS.dungeonGate);
  s = await waitFor((x) => x.doors["dungeon-gate-door"] === true, 8000);
  check("la llave abre la verja", s.doors["dungeon-gate-door"] === true, JSON.stringify(s.doors));
  check("la llave se consume", !s.inventory.includes("gold-key"), s.inventory.join());
  check("consumir la llave no suena como soltar", count(s.plays, "drop-default") === dropsBeforeKey);
  await page.waitForTimeout(DIALOG_MS);

  // 7. Persistencia tras recargar.
  check("tras recargar pasa la pantalla de carga", await enterGame());
  await page.waitForTimeout(3000);
  s = await state();
  check("la escena guardada se restaura", s.scene === "dungeon", `scene=${s.scene}`);
  check("el inventario guardado se restaura", s.inventory.slice().sort().join() === "gameboy,trophy", s.inventory.join());
  check("no reaparecen ítems ya recogidos", s.placed.length === 0, s.placed.join());
  check("la verja sigue abierta tras recargar", s.doors["dungeon-gate-door"] === true, JSON.stringify(s.doors));
  check("tras recargar suena la música de la mazmorra", count(s.plays, "dungeon-loop") === 1, `audio=${music(s.plays)}`);

  // 8. Reiniciar partida: borra el progreso y conserva lo demás.
  const keptBefore = await page.evaluate(() => {
    localStorage.setItem("smoke-foreign-key", "keep");
    return JSON.stringify([localStorage.getItem("i18n-locale"), localStorage.getItem("audio-settings")]);
  });
  await page.mouse.click(...POS.backpack);
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /Reiniciar/i }).first().click();
  await page.waitForTimeout(800);
  await Promise.all([
    page.waitForEvent("load", { timeout: 15000 }).catch(() => {}),
    page.mouse.click(...POS.confirmReset),
  ]);
  await page.waitForTimeout(1500);
  const afterReset = await page.evaluate(([saveKey, legacyKeys]) => ({
    game: [saveKey, ...legacyKeys].filter((k) => localStorage.getItem(k) !== null),
    foreign: localStorage.getItem("smoke-foreign-key"),
    kept: JSON.stringify([localStorage.getItem("i18n-locale"), localStorage.getItem("audio-settings")]),
  }), [SAVE_KEY, LEGACY_KEYS]);
  check("reiniciar borra las claves de la partida", afterReset.game.length === 0, afterReset.game.join());
  check("reiniciar conserva datos ajenos al juego", afterReset.foreign === "keep");
  check("reiniciar no toca idioma ni ajustes de audio", afterReset.kept === keptBefore, afterReset.kept);
  check("tras reiniciar se puede volver a entrar", await enterGame());
  await page.waitForTimeout(3000);
  s = await state();
  check("la partida reiniciada arranca en la habitación", s.scene === "personalRoom", `scene=${s.scene}`);
  check("la partida reiniciada tiene el inventario inicial", s.inventory.join() === "gameboy,gold-key", s.inventory.join());
  check("la partida reiniciada vuelve a sembrar el trofeo", s.placed.join() === "trophy@personalRoom", s.placed.join());

  // 9. Una partida guardada con el formato de 0.5.0 (cuatro claves sueltas) se migra al cargar.
  await page.evaluate(([saveKey]) => {
    localStorage.removeItem(saveKey);
    const slots = Array.from({ length: 9 }, () => null);
    slots[0] = { id: "gold-key", name: "Llave dorada", spriteUrl: "/assets/key/gold-key.png", quantity: 1 };
    slots[1] = { id: "trophy", name: "Trophy", spriteUrl: "/assets/trophy/trophy.png", quantity: 1 };
    localStorage.setItem("inventory-slots", JSON.stringify(slots));
    localStorage.setItem("current-scene-id", "dungeon");
    localStorage.setItem("placed-items-state", JSON.stringify({
      state: {
        items: [{ id: "gameboy-legacy", itemId: "gameboy", interactionId: "legacy-gameboy", name: "Gameboy", spriteUrl: "/assets/gameboy/gameboy.png", worldPosition: [3, -2, 20], canPickup: true, sceneId: "dungeon" }],
        initialItemsCreated: true,
      },
      version: 0,
    }));
    localStorage.setItem("door-states", JSON.stringify({ state: { doorOpenStates: { "dungeon-gate-door": true } }, version: 0 }));
  }, [SAVE_KEY]);
  check("tras inyectar una partida de 0.5.0 se puede cargar", await enterGame());
  await page.waitForTimeout(3000);
  s = await state();
  check("la partida de 0.5.0 conserva la escena", s.scene === "dungeon", `scene=${s.scene}`);
  check("la partida de 0.5.0 conserva el inventario", s.inventory.slice().sort().join() === "gold-key,trophy", s.inventory.join());
  check("la partida de 0.5.0 conserva el ítem colocado", s.placed.join() === "gameboy@dungeon", s.placed.join());
  check("la partida de 0.5.0 conserva las puertas", s.doors["dungeon-gate-door"] === true, JSON.stringify(s.doors));
  check("la migración traduce el flag antiguo a escena sembrada", s.seeded.join() === "personalRoom", s.seeded.join());
  check("existe la instantánea nueva (versión 1) y no quedan claves antiguas", s.version === 1 && s.legacyLeft.length === 0, `version=${s.version} antiguas=${s.legacyLeft.join()}`);
  check("la partida migrada no resiembra el trofeo", !s.placed.some((p) => p.startsWith("trophy@")), s.placed.join());

  // 10. Hotspot de personalRoom: menú de verbos, mirar y soltar un ítem encima (useItem).
  await injectSave({ sceneId: "personalRoom", items: [GAMEBOY] });
  check("tras inyectar una partida en personalRoom se puede cargar", await enterGame());
  await page.waitForTimeout(3000);
  s = await state();
  check("la partida inyectada arranca en personalRoom sin flags", s.scene === "personalRoom" && Object.keys(s.flags).length === 0, `scene=${s.scene} flags=${JSON.stringify(s.flags)}`);
  await page.waitForTimeout(DIALOG_MS); // bienvenida
  await page.mouse.click(...POS.computer);
  await page.waitForTimeout(800);
  const verbs = await page.getByRole("menuitem").allTextContents();
  check("clic en un hotspot con dos verbos abre el menú de verbos (traducido)", verbs.join() === "Usar,Mirar", verbs.join());
  await page.getByRole("menuitem", { name: /Mirar/ }).click();
  s = await waitFor((x) => x.flags["computer.seen"] === true, 8000);
  check("mirar el hotspot ejecuta su guion (flag en la partida guardada)", s.flags["computer.seen"] === true, JSON.stringify(s.flags));
  await page.waitForTimeout(DIALOG_MS);
  await dragFromInventory(/Gameboy/i, POS.computer);
  s = await waitFor((x) => x.flags["computer.gameboyTried"] === true, 8000);
  check("soltar el gameboy sobre el hotspot ejecuta su regla useItem", s.flags["computer.gameboyTried"] === true, JSON.stringify(s.flags));
  check("la regla useItem no quita el gameboy ni lo deja colocado", s.inventory.join() === "gameboy" && s.placed.length === 0, `inv=${s.inventory.join()} placed=${s.placed.join()}`);
  await page.waitForTimeout(DIALOG_MS);

  // 11. NPC de town: conversación con opciones (when / once), efecto con flag e ítem, y combinar ítems.
  await injectSave({ sceneId: "town", items: [GAMEBOY] });
  check("tras inyectar una partida en town se puede cargar", await enterGame());
  await page.waitForTimeout(3000);
  s = await state();
  check("la partida inyectada arranca en town y siembra el paletón", s.scene === "town" && s.placed.includes("key-bit@town"), `scene=${s.scene} placed=${s.placed.join()}`);
  await page.mouse.click(...POS.guide);
  check("clic en el NPC abre las opciones de diálogo", await waitForOptions(15000));
  let options = await optionTexts();
  check("sin trofeo la opción condicionada al trofeo no aparece", options.length === 3 && !options.some((o) => /trofeo/i.test(o)), options.join(" | "));
  await page.getByRole("option", { name: /Hasta luego/ }).click();
  await page.waitForTimeout(DIALOG_MS); // la despedida se cierra sola
  check("elegir la despedida cierra las opciones", (await page.locator('[role="listbox"]').count()) === 0);

  await injectSave({ sceneId: "town", items: [GAMEBOY, TROPHY] });
  await enterGame();
  await page.waitForTimeout(3000);
  await page.mouse.click(...POS.guide);
  await waitForOptions(15000);
  options = await optionTexts();
  check("con el trofeo aparece la opción condicionada (4 opciones)", options.length === 4 && options.some((o) => /trofeo/i.test(o)), options.join(" | "));
  await page.getByRole("option", { name: /ayudarme/ }).click();
  s = await waitFor((x) => x.inventory.includes("key-handle"), 8000);
  check("la opción entrega el ítem (mango roto en el inventario)", s.inventory.includes("key-handle"), s.inventory.join());
  check("la opción pone su flag en la partida guardada", s.flags["guide.helped"] === true, JSON.stringify(s.flags));
  check("la opción once deja constancia en la partida (dlg.guide-talk.root.2)", s.flags["dlg.guide-talk.root.2"] === true, JSON.stringify(s.flags));
  await waitForOptions(20000); // el guía responde y vuelve a las opciones
  options = await optionTexts();
  check("la opción once ya no se vuelve a ofrecer", options.length === 3 && !options.some((o) => /ayudarme/.test(o)), options.join(" | "));
  await page.getByRole("option", { name: /Hasta luego/ }).click();
  await page.waitForTimeout(DIALOG_MS);
  await page.mouse.click(...POS.keyBit);
  s = await waitFor((x) => x.inventory.includes("key-bit"), 15000);
  check("recoger el paletón del suelo lo mete en el inventario", s.inventory.includes("key-bit"), s.inventory.join());
  await page.waitForTimeout(DIALOG_MS);

  check("se puede arrastrar un ítem sobre otro slot", await dragSlotOntoSlot(/Gameboy/i, /Trophy/i));
  await page.waitForTimeout(2500);
  s = await state();
  check("combinar ítems sin receta no pierde ninguno", s.inventory.slice().sort().join() === "gameboy,key-bit,key-handle,trophy", s.inventory.join());
  await page.waitForTimeout(DIALOG_MS);
  await dragSlotOntoSlot(/Mango/i, /Palet/i);
  s = await waitFor((x) => x.inventory.includes("bronze-key"), 8000);
  check("soltar el mango sobre el paletón produce la llave de bronce", s.inventory.includes("bronze-key"), s.inventory.join());
  check("la combinación consume los dos ingredientes y no toca los demás", s.inventory.slice().sort().join() === "bronze-key,gameboy,trophy", s.inventory.join());
  await page.waitForTimeout(DIALOG_MS);

  check("sin errores de página ni de consola", errors.length === 0, errors.slice(0, 3).join(" | "));
} catch (error) {
  check("el smoke terminó sin excepción", false, String(error).slice(0, 300));
} finally {
  if (process.argv[3]) await page.screenshot({ path: process.argv[3] }).catch(() => {});
  await browser.close();
}

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} comprobaciones correctas`);
process.exit(failed.length === 0 ? 0 : 1);
