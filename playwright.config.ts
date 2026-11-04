import { defineConfig, devices } from '@playwright/test';

// Each worker is a whole browser; 2 keeps a laptop's memory free (PW_WORKERS=4 for more).
const workers = Number(process.env.PW_WORKERS) || 2;

export default defineConfig({
  testDir: 'test/e2e',
  fullyParallel: true,
  workers,
  reporter: 'line',
  use: { baseURL: 'http://localhost:4400' },
  webServer: { command: 'npx esbuild --servedir=. --serve=4400', port: 4400, reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], viewport: { width: 375, height: 812 } } },
  ],
});
