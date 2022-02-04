import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/speex/workletProcessor.ts',
    'src/noiseGate/workletProcessor.ts',
    'src/rnnoise/workletProcessor.ts'
  ],
  target: 'es2019',
  platform: 'browser',
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  external: ['fs', 'path'],
  define: {
    window: '{}' // to be detected as ENVIRONMENT_IS_WEB with EmscriptenModule
  }
})
