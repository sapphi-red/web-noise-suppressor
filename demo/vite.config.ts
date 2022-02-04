import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

export default defineConfig({
  build: {
    target: 'es2019',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
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
