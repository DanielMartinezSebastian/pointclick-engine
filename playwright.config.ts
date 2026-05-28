import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    headless: false, // headed para poder ver lo que ocurre
    viewport: { width: 1280, height: 720 },
    video: "on",
    screenshot: "on",
    launchOptions: {
      args: [
        // Evitar que Chrome pause requestAnimationFrame en tabs de fondo o tras inactividad.
        // Esto permite que el loop de Three.js/Rapier siga corriendo durante los waits del test.
        "--disable-background-timer-throttling",
        "--disable-renderer-backgrounding",
        "--disable-backgrounding-occluded-windows",
      ],
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
