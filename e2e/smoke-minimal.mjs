// Smoke headless de /example-minimal: un juego que solo importa de los paquetes.
// Uso: node e2e/smoke-minimal.mjs [baseUrl]   (requiere el servidor de la demo en marcha)
// SMOKE_PATH cambia la ruta de la página (por defecto /example-minimal); sirve para
// probar el mismo ejemplo servido desde un proyecto externo al monorepo.
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const PAGE_PATH = process.env.SMOKE_PATH ?? "/example-minimal";
const TROPHY = [789, 540]; // viewport 1280x720, escena minimal-a
const checks = [];
const check = (name, ok, detail = "") => {
  checks.push(Boolean(ok));
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 300)); });
page.on("response", (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url().slice(0, 120)}`); });

const status = async () => (await page.textContent('[data-testid="minimal-status"]')) ?? "";
const waitForStatus = async (pattern, timeoutMs) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (pattern.test(await status())) return true;
    await page.waitForTimeout(500);
  }
  return false;
};

try {
  await page.goto(`${BASE}${PAGE_PATH}`, { waitUntil: "networkidle" });
  await page.waitForSelector("canvas", { timeout: 30000 });
  check("arranca en la escena inicial con el ítem sembrado", await waitForStatus(/escena: minimal-a \| inventario: 0 \| en escena: 1/, 20000), await status());
  await page.waitForTimeout(4000);

  await page.mouse.click(...TROPHY);
  check("recoger el ítem con un click lo mete en el inventario", await waitForStatus(/inventario: 1 \| en escena: 0/, 15000), await status());
  await page.waitForTimeout(9000); // el bocadillo de recogida se cierra solo

  await page.keyboard.down("w");
  const changed = await waitForStatus(/escena: minimal-b/, 20000);
  await page.keyboard.up("w");
  check("caminar hasta la zona de transición cambia de escena", changed, await status());
  check("el inventario se conserva al cambiar de escena", /inventario: 1/.test(await status()), await status());

  check("sin errores de página ni de consola", errors.length === 0, errors.slice(0, 3).join(" | "));
} catch (error) {
  check("el smoke terminó sin excepción", false, String(error).slice(0, 300));
} finally {
  if (process.argv[3]) await page.screenshot({ path: process.argv[3] }).catch(() => {});
  await browser.close();
}

const failed = checks.filter((ok) => !ok).length;
console.log(`\n${checks.length - failed}/${checks.length} comprobaciones correctas`);
process.exit(failed === 0 ? 0 : 1);
