import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: process.env.CI ? 60000 : 30000,

  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ...(process.env.CI ? [['junit', { outputFile: 'test-results/junit.xml' }] as const] : []),
  ],

  use: {
    baseURL: process.env.TEST_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    extraHTTPHeaders: process.env.CI_BYPASS_TOKEN
      ? { 'x-ci-bypass': process.env.CI_BYPASS_TOKEN }
      : {},
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      timeout: 180_000,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      // Desktop NO corre los specs mobile (tienen asserts de layout mobile-only)
      testIgnore: /\.mobile\.spec\.ts$/,
    },
    // Mobile (M-03 / Bloque B): solo el flujo CRITICO del taller en pantalla
    // chica, no toda la suite (costo de CI). Ambos chromium-based (CI instala
    // solo chromium). Cubren los fixes de #431: wizard navegable, KPI grid sin
    // desborde, login stack, nav sticky.
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }, // 393px, dispositivo realista (UA/touch mobile)
      dependencies: ['setup'],
      testMatch: /\.mobile\.spec\.ts$/,
    },
    {
      name: 'mobile-small',
      // 320px = caso peor (la pantalla mas chica comun): estresa al maximo los
      // fixes de wrap/stack/grid-cols-1 de #431.
      use: { ...devices['Pixel 5'], viewport: { width: 320, height: 800 } },
      dependencies: ['setup'],
      testMatch: /\.mobile\.spec\.ts$/,
    },
  ],

  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
})
