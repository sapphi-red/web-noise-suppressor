import { Rnnoise } from '@shiguredo/rnnoise-wasm'

export const loadRnnoise = (path: string) =>
  Rnnoise.load({
    assetsPath: path
  })
