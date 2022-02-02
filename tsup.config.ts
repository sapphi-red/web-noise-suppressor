import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/speex/workletProcessor.ts',
    'src/noiseGate/workletProcessor.ts'
  ],
  target: 'es2019',
  platform: 'browser',
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true
})
