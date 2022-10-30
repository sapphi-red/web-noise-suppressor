import { defineConfig } from 'tsup'
import type { Options } from 'tsup'

export default defineConfig(() => {
  const common: Options = {
    target: 'es2020',
    platform: 'browser',
    dts: true,
    sourcemap: true,
    external: ['fs', 'path'],
    define: {
      window: '{}' // to be detected as ENVIRONMENT_IS_WEB with EmscriptenModule
    }
  }

  const mainEntry: Options = {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    ...common
  }
  const workletEntries: Options = {
    entry: [
      'src/speex/workletProcessor.ts',
      'src/noiseGate/workletProcessor.ts',
      'src/rnnoise/workletProcessor.ts'
    ],
    ...common,
    format: ['esm'],
    minify: true,
    splitting: false // to prevent "import" inside worklet which breaks vite
  }

  return [mainEntry, workletEntries]
})
