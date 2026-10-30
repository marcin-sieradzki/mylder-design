import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { designRevisionsPlugin } from './scripts/design-revisions.ts'
import { generatePlugin } from './scripts/generate-plugin.ts'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // GitHub Pages serves the site under /mylder-design/; CI sets BASE_PATH
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), designRevisionsPlugin(`${root}designs`), generatePlugin(root)],
  build: {
    rollupOptions: {
      input: {
        studio: `${root}index.html`,
        canvas: `${root}canvas.html`,
      },
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
  },
})
