import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/speex/workletProcessor.ts',
    'src/noiseGate/workletProcessor.ts',
    'src/rnnoise/workletProcessor.ts'
  ],
  target: 'es2020',
  platform: 'browser',
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  splitting: false, // to prevent "import" inside worklet which breaks vite
  external: ['fs', 'path'],
  define: {
    window: '{}' // to be detected as ENVIRONMENT_IS_WEB with EmscriptenModule
  }
})
