import { defineConfig } from 'tsup'

export default defineConfig({
  target: 'es2019',
  platform: 'browser',
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true
})
