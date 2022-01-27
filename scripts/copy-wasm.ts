import fs from 'node:fs/promises'
import { URL } from 'node:url'

const resolveFromRoot = (path: string) => new URL(`../${path}`, import.meta.url)

const inputs = [
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
]

for (const { from, to } of inputs) {
  await fs.copyFile(resolveFromRoot(from), resolveFromRoot(to))
}
