// Smoke headless de /adventure: recorre el camino principal de la aventura, de la intro a los
// créditos, y comprueba la partida guardada (flags e inventario) tras cada puzzle.
// Uso: node e2e/smoke-adventure.mjs [baseUrl] [captura.png]   (requiere el servidor de la demo en marcha)
// ADVENTURE_SHOTS=<carpeta> guarda además una captura por hito.
// Sale con código 1 si alguna comprobación falla.
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const SHOTS = process.env.ADVENTURE_SHOTS ?? "";
// Coordenadas para viewport 1280x720 (los fondos son fijos y la cámara también).
const POS = {
  backpack: [82, 640],
  // adv-room
  duckBeak: [528, 577], computer: [270, 320], bed: [1010, 440], roomDoorstep: [570, 455],
  // adv-town
  mug: [360, 598], glitch: [950, 390], mineDoor: [340, 340], mineDoorstep: [345, 520],
  stairs: [900, 445], townSouth: [660, 640],
  // adv-backlog
  beans: [390, 616], bucket: [838, 616], helix: [765, 420], archDoorstep: [610, 420],
  // adv-engine
  console: [770, 340], intercom: [1120, 330], engineEast: [1150, 560], engineSouth: [640, 650],
  // adv-heap
  leak: [880, 290], heapWest: [140, 560],
};

const checks = [];
const check = (name, ok, detail = "") => {
  checks.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--autoplay-policy=no-user-gesture-required"],
});
// El smoke corre en español.
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale: "es-ES" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
page.on("response", (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url().slice(0, 120)}`); });

const SAVE_KEY = "adventure:pointclick-save";
const DEMO_SAVE_KEY = "pointclick-save"; // la partida de `/`: la aventura no debe tocarla
const state = () => page.evaluate((saveKey) => {
  let save = null;
  try { save = JSON.parse(localStorage.getItem(saveKey) ?? "null"); } catch { /* sin partida */ }
  return {
    scene: save?.sceneId ?? null,
    inventory: (save?.inventory ?? []).filter(Boolean).map((s) => s.id),
    flags: save?.flags ?? {},
    placed: (save?.placedItems ?? []).map((i) => `${i.itemId}@${i.sceneId}`),
    keys: Object.keys(localStorage),
  };
}, SAVE_KEY);
const waitFor = async (predicate, timeoutMs) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const s = await state();
    if (predicate(s)) return s;
    await page.waitForTimeout(400);
  }
  return state();
};
// Espera a que el bocadillo lleve un rato cerrado (los guiones encadenan varios `say`).
const quiet = async (timeoutMs = 60000) => {
  const start = Date.now();
  let calm = 0;
  while (Date.now() - start < timeoutMs && calm < 6) {
    const speech = await page.locator('[data-testid="adventure-status"]').getAttribute("data-speech").catch(() => "on");
    calm = speech === "off" ? calm + 1 : 0;
    await page.waitForTimeout(200);
  }
};
const shot = (name) => (SHOTS ? page.screenshot({ path: `${SHOTS}/${name}.png` }).catch(() => {}) : Promise.resolve());
const has = (s, ...ids) => ids.every((id) => s.inventory.includes(id));
const lacks = (s, ...ids) => ids.every((id) => !s.inventory.includes(id));
const flagsSet = (s, ...names) => names.every((n) => s.flags[n] === true);

// ADVENTURE_QS=?debug expone la posición del jugador en los mensajes de fallo (solo con debug en el servidor).
const QS = process.env.ADVENTURE_QS ?? "";
const where = () => page.evaluate(() => { const st = window.__sceneStore?.getState(); return st ? `${st.sceneId}@${st.playerPosition.map((n) => n.toFixed(1))}` : ""; }).catch(() => "");
const enterGame = async (clickLabel = /EMPEZAR|CONTINUAR/) => {
  await page.goto(`${BASE}/adventure${QS}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: clickLabel }).first().click();
  return page
    .waitForFunction(() => document.querySelector("canvas") && !document.querySelector('[aria-label="Cargando…"]'), null, { timeout: 40000 })
    .then(() => true, () => false);
};
// Clic en un hotspot con varios verbos: abre el menú y elige uno.
const verb = async (target, name) => {
  await page.mouse.click(...target);
  await page.waitForTimeout(700);
  const items = await page.getByRole("menuitem").allTextContents();
  await page.getByRole("menuitem", { name }).click();
  return items;
};
// Abre la mochila y arrastra el ítem cuyo slot contiene `label` hasta `target`.
const dragFromInventory = async (label, target) => {
  await page.mouse.click(...POS.backpack);
  await page.waitForTimeout(500);
  const box = await page.getByRole("button", { name: label }).first().boundingBox();
  if (!box) return false;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(target[0], target[1], { steps: 25 });
  await page.waitForTimeout(300);
  await page.mouse.up();
  return true;
};
// Arrastra el ítem del slot `from` y lo suelta sobre el slot `to` (combinar).
const dragSlotOntoSlot = async (from, to, shotName = "") => {
  await page.mouse.click(...POS.backpack);
  await page.waitForTimeout(500);
  const a = await page.getByRole("button", { name: from }).first().boundingBox();
  const b = await page.getByRole("button", { name: to }).first().boundingBox();
  if (!a || !b) return false;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 20 });
  await page.waitForTimeout(300);
  if (shotName) await shot(shotName);
  await page.mouse.up();
  return true;
};
// Camina hasta `spot` con un clic en el suelo y empuja con la tecla `key` (las transiciones son zonas).
const walkThrough = async (spot, key, holdMs = 2500, settleMs = 4500) => {
  const before = (await state()).scene;
  await page.mouse.click(...spot);
  await page.waitForTimeout(settleMs);
  if (QS) console.log("  walk: en el umbral", await where());
  // Si el propio paseo ya ha cruzado la zona (venía de dentro de ella), no hay nada que empujar.
  if ((await state()).scene !== before) return;
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
  if (QS) console.log("  walk: tras empujar", await where());
};
const waitForOptions = (timeoutMs) => page.waitForSelector('[role="listbox"]', { timeout: timeoutMs }).then(() => true, () => false);

try {
  // 0. Intro y arranque.
  await page.goto(`${BASE}/adventure`, { waitUntil: "networkidle" });
  await page.evaluate((key) => localStorage.setItem(key, "sentinel-demo-save"), DEMO_SAVE_KEY);
  check("la intro muestra el título en español", await page.getByRole("heading", { name: /No es un bug, es una feature/ }).count() === 1);
  check("la partida nueva pasa la pantalla de carga", await enterGame());
  let s = await waitFor((x) => x.scene === "adv-room", 20000);
  check("arranca en la habitación sin inventario", s.scene === "adv-room" && s.inventory.length === 0, `scene=${s.scene}`);
  check("el suelo de la habitación está sembrado con el pico", s.placed.includes("duck-beak@adv-room"), s.placed.join());
  s = await waitFor((x) => x.flags["intro.done"] === true, 15000);
  check("la intro del Programador marca intro.done", flagsSet(s, "intro.done"), JSON.stringify(s.flags));
  await shot("01-room-intro");
  await quiet();
  await shot("01b-room-clean");

  // 1. Habitación: pico, puerta bloqueada, ordenador, cama, punto y coma.
  await page.mouse.click(...POS.duckBeak);
  s = await waitFor((x) => has(x, "duck-beak"), 15000);
  check("recoger el pico del suelo lo mete en el inventario", has(s, "duck-beak"), s.inventory.join());
  await quiet();
  await walkThrough(POS.roomDoorstep, "w", 2500, 5000);
  s = await state();
  check("la puerta no lleva a ninguna parte sin reparar el ordenador", s.scene === "adv-room" && !s.flags["door.fixed"], `scene=${s.scene}`);
  await shot("02-door-blocked");
  await quiet();
  const verbsComputer = await verb(POS.computer, /Mirar/);
  check("clic en el ordenador abre el menú de verbos (traducido)", verbsComputer.join() === "Usar,Mirar", verbsComputer.join());
  s = await waitFor((x) => flagsSet(x, "log.read"), 8000);
  check("mirar el ordenador lee el log (flag log.read)", flagsSet(s, "log.read"), JSON.stringify(s.flags));
  await quiet();
  await page.mouse.click(...POS.bed);
  s = await waitFor((x) => has(x, "semicolon"), 10000);
  check("mirar la cama da el punto y coma", has(s, "semicolon") && flagsSet(s, "semicolon.found"), s.inventory.join());
  await quiet();
  await dragFromInventory(/Punto y coma/i, POS.computer);
  s = await waitFor((x) => flagsSet(x, "door.fixed"), 10000);
  check("el punto y coma sobre el ordenador repara la puerta", flagsSet(s, "door.fixed") && lacks(s, "semicolon"), `${JSON.stringify(s.flags)} inv=${s.inventory.join()}`);
  check("la partida conserva solo el pico", s.inventory.join() === "duck-beak", s.inventory.join());
  await quiet();
  await walkThrough(POS.roomDoorstep, "w", 2500, 5000);
  s = await waitFor((x) => x.scene === "adv-town", 15000);
  check("la puerta reparada lleva al pueblo", s.scene === "adv-town", `scene=${s.scene}`);
  await shot("03-town");
  await page.waitForTimeout(2500);

  // 2. Pueblo: el glitch en bucle y el pico de pato.
  await page.mouse.click(...POS.mug);
  s = await waitFor((x) => has(x, "empty-mug"), 15000);
  check("recoger la taza del pueblo", has(s, "empty-mug"), s.inventory.join());
  await quiet();
  await dragFromInventory(/Pico/i, POS.glitch);
  s = await waitFor((x) => flagsSet(x, "hint.postit"), 10000);
  check("el pico sobre el glitch suelta la pista del pergamino", flagsSet(s, "hint.postit") && has(s, "duck-beak"), JSON.stringify(s.flags));
  await shot("04-glitch-duck");
  await quiet();

  // 3. Pergamino del ordenador y puerta de la mina.
  await page.mouse.click(...POS.townSouth);
  await page.waitForTimeout(5000);
  await page.keyboard.down("s");
  await page.waitForTimeout(2500);
  await page.keyboard.up("s");
  s = await waitFor((x) => x.scene === "adv-room", 15000);
  check("el sur del pueblo lleva a la habitación", s.scene === "adv-room", `scene=${s.scene}`);
  await page.waitForTimeout(2500);
  await verb(POS.computer, /Mirar/);
  s = await waitFor((x) => has(x, "sticky-note"), 10000);
  check("mirar el ordenador tras la pista da el pergamino", has(s, "sticky-note") && flagsSet(s, "note.given"), s.inventory.join());
  await quiet();
  await walkThrough(POS.roomDoorstep, "w", 2500, 5000);
  await waitFor((x) => x.scene === "adv-town", 15000);
  await page.waitForTimeout(2500);
  await walkThrough(POS.mineDoorstep, "w", 2500, 4500);
  s = await state();
  check("la mina cerrada no deja pasar (muestra su frase)", s.scene === "adv-town" && !s.flags["backlog.open"], `scene=${s.scene}`);
  await quiet();
  await dragFromInventory(/Pergamino/i, POS.mineDoor);
  s = await waitFor((x) => flagsSet(x, "backlog.open"), 10000);
  check("el pergamino sobre la puerta abre la mina sin gastarse", flagsSet(s, "backlog.open") && has(s, "sticky-note"), `${JSON.stringify(s.flags)} inv=${s.inventory.join()}`);
  await shot("05-mine-open");
  await quiet();
  await walkThrough(POS.mineDoorstep, "w", 2500, 4500);
  s = await waitFor((x) => x.scene === "adv-backlog", 15000);
  check("la mina abierta lleva al backlog", s.scene === "adv-backlog", `scene=${s.scene} ${await where()}`);
  await shot("06-backlog");
  await page.waitForTimeout(2500);

  // 4. Backlog: café, cubo, Helix y los punteros.
  await page.mouse.click(...POS.beans);
  s = await waitFor((x) => has(x, "coffee-beans"), 15000);
  check("recoger el saco de café", has(s, "coffee-beans"), s.inventory.join());
  await quiet();
  await page.mouse.click(...POS.bucket);
  s = await waitFor((x) => has(x, "bucket"), 15000);
  check("recoger el cubo", has(s, "bucket"), s.inventory.join());
  await quiet();
  const verbsHelix = await verb(POS.helix, /Hablar/);
  check("clic en Helix ofrece hablar y mirar", verbsHelix.join() === "Hablar,Mirar", verbsHelix.join());
  check("la conversación con Helix muestra opciones", await waitForOptions(30000));
  await shot("07-helix-dialogue");
  await page.getByRole("option", { name: /por qué no vuelves/ }).click();
  s = await waitFor((x) => has(x, "null-pointer"), 10000);
  check("Helix entrega el puntero nulo", has(s, "null-pointer"), s.inventory.join());
  check("tras entregarlo vuelven las opciones", await waitForOptions(30000));
  const optionsLeft = await page.locator('[role="option"]').allTextContents();
  check("la opción del puntero ya no se ofrece (once)", optionsLeft.length === 2 && !optionsLeft.some((o) => /por qué no vuelves/.test(o)), optionsLeft.join(" | "));
  await page.getByRole("option", { name: /Suerte/ }).click();
  await quiet();
  await shot("08-backpack-before-combine");
  check("se puede arrastrar un ítem sobre otro slot", await dragSlotOntoSlot(/Puntero nulo/i, /Pergamino/i, "09-backpack-combining"));
  s = await waitFor((x) => has(x, "valid-pointer"), 10000);
  check("puntero nulo + pergamino da el puntero válido", has(s, "valid-pointer") && lacks(s, "null-pointer", "sticky-note"), s.inventory.join());
  await quiet();
  await dragFromInventory(/Puntero válido/i, POS.helix);
  s = await waitFor((x) => flagsSet(x, "helix.home"), 10000);
  check("devolver el puntero válido a Helix da el break", flagsSet(s, "helix.home") && has(s, "break") && lacks(s, "valid-pointer"), `${JSON.stringify(s.flags)} inv=${s.inventory.join()}`);
  await quiet();
  await shot("10-helix-gone");
  await page.mouse.click(...POS.archDoorstep);
  await page.waitForTimeout(4500);
  await page.keyboard.down("w");
  await page.waitForTimeout(2500);
  await page.keyboard.up("w");
  s = await waitFor((x) => x.scene === "adv-town", 15000);
  check("el arco del backlog vuelve al pueblo", s.scene === "adv-town", `scene=${s.scene}`);
  await page.waitForTimeout(2500);

  // 5. Pueblo: el break libera al glitch; café.
  await walkThrough(POS.stairs, "w", 2500, 4500);
  s = await state();
  check("las escaleras no dejan pasar mientras el glitch está en bucle", s.scene === "adv-town" && !s.flags["glitch.fixed"], `scene=${s.scene}`);
  await shot("11-stairs-blocked");
  await quiet();
  await dragFromInventory(/break/i, POS.glitch);
  s = await waitFor((x) => flagsSet(x, "glitch.fixed"), 10000);
  check("el break libera al glitch", flagsSet(s, "glitch.fixed") && lacks(s, "break"), `${JSON.stringify(s.flags)} inv=${s.inventory.join()}`);
  await quiet();
  check("combinar la taza con el saco", await dragSlotOntoSlot(/Taza/i, /Saco/i));
  s = await waitFor((x) => has(x, "coffee"), 10000);
  check("taza + saco da el café frío", has(s, "coffee") && lacks(s, "empty-mug", "coffee-beans"), s.inventory.join());
  await quiet();
  await walkThrough(POS.stairs, "w", 2500, 4500);
  s = await waitFor((x) => x.scene === "adv-engine", 15000);
  check("las escaleras, ya libres, llevan a la sala de máquinas", s.scene === "adv-engine", `scene=${s.scene}`);
  await shot("12-engine");
  await page.waitForTimeout(2500);

  // 6. Sala de máquinas: consola, interfono, heap.
  await verb(POS.console, /Usar/);
  await quiet();
  s = await state();
  check("la consola con dos errores no cambia el estado", !flagsSet(s, "game.finished", "programmer.awake"), JSON.stringify(s.flags));
  await dragFromInventory(/Café/i, POS.intercom);
  s = await waitFor((x) => flagsSet(x, "programmer.awake"), 10000);
  check("el café por el interfono despierta al Programador", flagsSet(s, "programmer.awake") && lacks(s, "coffee"), `${JSON.stringify(s.flags)} inv=${s.inventory.join()}`);
  await shot("13-programmer-awake");
  await quiet();
  await page.mouse.click(...POS.engineEast);
  await page.waitForTimeout(4500);
  await page.keyboard.down("d");
  await page.waitForTimeout(2500);
  await page.keyboard.up("d");
  s = await waitFor((x) => x.scene === "adv-heap", 15000);
  check("el este de la sala de máquinas lleva al heap", s.scene === "adv-heap", `scene=${s.scene}`);
  await shot("14-heap");
  await page.waitForTimeout(2500);
  await dragFromInventory(/Cubo/i, POS.leak);
  s = await waitFor((x) => flagsSet(x, "leak.fixed"), 10000);
  check("el cubo bajo la fuga la resuelve", flagsSet(s, "leak.fixed") && lacks(s, "bucket"), `${JSON.stringify(s.flags)} inv=${s.inventory.join()}`);
  await quiet();
  await page.mouse.click(...POS.heapWest);
  await page.waitForTimeout(4500);
  await page.keyboard.down("a");
  await page.waitForTimeout(2500);
  await page.keyboard.up("a");
  s = await waitFor((x) => x.scene === "adv-engine", 15000);
  check("el oeste del heap vuelve a la sala de máquinas", s.scene === "adv-engine", `scene=${s.scene}`);
  await page.waitForTimeout(2500);

  // 7. Final: compila y créditos.
  await verb(POS.console, /Usar/);
  s = await waitFor((x) => flagsSet(x, "game.finished"), 15000);
  check("la consola con los dos errores resueltos compila (game.finished)", flagsSet(s, "game.finished"), JSON.stringify(s.flags));
  const credits = page.getByTestId("adventure-credits");
  check("tras el último bocadillo salen los créditos", await credits.waitFor({ timeout: 60000 }).then(() => true, () => false));
  const creditsText = (await credits.textContent().catch(() => "")) ?? "";
  check("los créditos incluyen las atribuciones de arte", /Jeremy Gooch/.test(creditsText) && /CC-BY 3\.0/.test(creditsText) && /DeMoNiCaTeD/.test(creditsText) && /CC-BY-SA 4\.0/.test(creditsText) && /CC0/.test(creditsText), creditsText.slice(0, 120));
  await shot("15-credits");

  // 8. Claves de localStorage: la aventura solo escribe las suyas, con prefijo.
  s = await state();
  const ownKeys = s.keys.filter((k) => k !== DEMO_SAVE_KEY);
  check("la aventura solo escribe claves con prefijo adventure:", ownKeys.length > 0 && ownKeys.every((k) => k.startsWith("adventure:")), ownKeys.join());
  const demoSave = await page.evaluate((k) => localStorage.getItem(k), DEMO_SAVE_KEY);
  check("la partida de `/` (pointclick-save) queda intacta", demoSave === "sentinel-demo-save", String(demoSave));
  check("las claves antiguas y de ajustes de `/` no aparecen", !s.keys.some((k) => ["i18n-locale", "audio-settings", "inventory-slots", "current-scene-id", "door-states", "placed-items-state"].includes(k)), s.keys.join());

  // 9. Seguir explorando, recargar con la partida guardada y nueva partida.
  await page.getByRole("button", { name: /Seguir explorando/ }).click();
  check("«seguir explorando» cierra los créditos", (await credits.count()) === 0);
  check("tras recargar, la intro ofrece continuar y se vuelve a entrar", await enterGame(/CONTINUAR/));
  s = await waitFor((x) => x.scene === "adv-engine", 20000);
  check("la partida guardada se restaura (escena, flags e inventario)", s.scene === "adv-engine" && flagsSet(s, "game.finished", "leak.fixed", "programmer.awake") && s.inventory.join() === "duck-beak", `scene=${s.scene} inv=${s.inventory.join()}`);
  await page.waitForTimeout(3000);
  await page.mouse.click(...POS.backpack);
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /Nueva partida/ }).first().click();
  await page.waitForTimeout(800);
  await Promise.all([
    page.waitForEvent("load", { timeout: 15000 }).catch(() => {}),
    page.getByRole("button", { name: /Nueva partida/ }).first().click(),
  ]);
  await page.waitForTimeout(1500);
  const afterReset = await page.evaluate(([own, demo]) => ({ own: localStorage.getItem(own), demo: localStorage.getItem(demo) }), [SAVE_KEY, DEMO_SAVE_KEY]);
  check("nueva partida borra la partida de la aventura", afterReset.own === null, String(afterReset.own).slice(0, 60));
  check("nueva partida no toca la partida de `/`", afterReset.demo === "sentinel-demo-save", String(afterReset.demo));
  check("tras la nueva partida se vuelve a empezar de cero", await enterGame(/EMPEZAR/));
  s = await waitFor((x) => x.scene === "adv-room" && x.placed.includes("duck-beak@adv-room"), 20000);
  check("la partida nueva arranca en la habitación sin inventario", s.scene === "adv-room" && s.inventory.length === 0 && !s.flags["door.fixed"], `scene=${s.scene} inv=${s.inventory.join()}`);

  // 10. Inglés: mismo mecanismo de idioma, con su propia clave.
  await page.goto(`${BASE}/adventure`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "English" }).click();
  check("el selector de la intro cambia a inglés", await page.getByRole("heading", { name: /It's not a bug, it's a feature/ }).count() === 1);
  const locale = await page.evaluate(() => ({ own: localStorage.getItem("adventure:i18n-locale"), demo: localStorage.getItem("i18n-locale") }));
  check("el idioma se guarda con la clave de la aventura", locale.own === "en" && locale.demo === null, JSON.stringify(locale));

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
