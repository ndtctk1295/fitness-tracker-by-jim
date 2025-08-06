import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  globalSetup: require.resolve('./e2e/global-setup'),
  testDir: './e2e/tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'mobile',
      use: { 
        ...devices['iPhone 13'],
        hasTouch: true,  // Enable touch support for mobile tests
        // Add session isolation for mobile
        storageState: undefined,
      },
      // Force mobile tests to run sequentially to avoid session conflicts
      fullyParallel: false,
      testMatch: /.*\.spec\.ts$/,
    },
  ],
  webServer: {
    command: 'cross-env MONGODB_URI=mongodb://localhost:27017/fitness-tracker-e2e npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
