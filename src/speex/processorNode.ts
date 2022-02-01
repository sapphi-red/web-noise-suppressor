import { type SpeexModule } from '@sapphi-red/speex-preprocess-wasm'
import { createScriptProcessorNode } from '../utils/scriptProcessor'
import { createProcessor } from './processor'

export const createSpeexProcessorNode = (
  ctx: AudioContext,
  module: SpeexModule,
  { bufferSize, channels }: { bufferSize: number; channels: number }
) => {
  const processor = createProcessor(module, {
    bufferSize,
    channels,
    sampleRate: ctx.sampleRate
  })

  const node = createScriptProcessorNode(
    ctx,
    processor.process,
    bufferSize,
    channels,
    channels
  )

  return {
    node,
    getProperty: processor.getProperty,
    setProperty: processor.setProperty,
    destroy: processor.destroy
  }
}
