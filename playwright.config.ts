// The studio as the public sees it: the static build, served the way GitHub Pages serves it.
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173/mylder-design/',
    // CHROMIUM_PATH points at a browser of your own when Playwright's isn't installed
    launchOptions: { executablePath: process.env.CHROMIUM_PATH },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    env: { BASE_PATH: '/mylder-design/' },
    url: 'http://localhost:4173/mylder-design/',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
