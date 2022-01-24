import fs from 'node:fs/promises'
import { URL } from 'node:url'

const resolveFromRoot = (path: string) => new URL(`../${path}`, import.meta.url)

await fs.copyFile(
  resolveFromRoot(
    'node_modules/@sapphi-red/speex-preprocess-wasm/dist/speex.wasm'
  ),
  resolveFromRoot('dist/speex.wasm')
)
