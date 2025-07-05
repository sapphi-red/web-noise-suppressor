import { defineConfig } from 'tsdown'
import type { Options } from 'tsdown'

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
    copy: [
      {
        from: 'node_modules/@sapphi-red/speex-preprocess-wasm/dist/speex.wasm',
        to: 'dist/speex.wasm'
      },
      {
        from: 'node_modules/@shiguredo/rnnoise-wasm/dist/rnnoise.wasm',
        to: 'dist/rnnoise.wasm'
      },
      {
        from: 'node_modules/@shiguredo/rnnoise-wasm/dist/rnnoise.wasm',
        to: 'dist/rnnoise_simd.wasm'
      }
    ],
    ...common
  }
  const workletEntries: Options[] = [
    'src/speex/workletProcessor.ts',
    'src/noiseGate/workletProcessor.ts',
    'src/rnnoise/workletProcessor.ts'
  ].map(entry => ({
    entry: {
      [entry.replace(/^src\//, '').replace(/\.ts$/, '')]: entry
    },
    ...common,
    format: ['esm' as const],
    minify: true
  }))

  return [mainEntry, ...workletEntries]
})
