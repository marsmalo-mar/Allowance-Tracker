import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  globalSetup: "./tests/e2e/setup.mjs",
  use: {
    ...devices["Desktop Edge"],
    channel: "msedge",
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://127.0.0.1:3100/health",
    reuseExistingServer: false,
    timeout: 120000,
    env: { DB_NAME: "allowance_tracker_e2e", NEXT_TELEMETRY_DISABLED: "1" },
  },
});
