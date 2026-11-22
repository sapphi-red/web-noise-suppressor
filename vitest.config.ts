import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        optimizeDeps: {
          // AudioWorklet modules are loaded at runtime, outside Vite's initial dependency scan.
          include: [
            '@sapphi-red/gtcrn-wasm',
            '@sapphi-red/speex-preprocess-wasm',
            '@shiguredo/rnnoise-wasm',
          ],
          rolldownOptions: {
            // Like the package build, let Emscripten detect the worklet as a browser environment.
            transform: { define: { window: 'globalThis' } },
          },
        },
        test: {
          name: 'e2e',
          include: ['tests/**/*.spec.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
            }),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})
