import { loadSpeexModule } from '@sapphi-red/speex-preprocess-wasm'

export const loadSpeex = (path: string) =>
  loadSpeexModule({
    locateFile: () => path
  })
