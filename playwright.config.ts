import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command: 'pnpm dev:api',
      port: 4000,
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'pnpm dev:web',
      port: 3000,
      reuseExistingServer: !process.env.CI
    }
  ]
});
