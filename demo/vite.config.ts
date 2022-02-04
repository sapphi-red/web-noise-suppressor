import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  build: {
    target: 'es2019',
    assetsInlineLimit: 0
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@sapphi-red/web-noise-suppressor/dist/*.wasm',
          dest: 'wasms'
        },
        {
          src: 'node_modules/@siguredo/rnnoise-wasm/dist/*.wasm',
          dest: 'wasms'
        }
      ]
    })
  ]
})
