import { type Rnnoise } from '@shiguredo/rnnoise-wasm'
import { createScriptProcessorNode } from '../utils/scriptProcessor'
import { createProcessor } from './processor'

export const createRnnoiseProcessorNode = (
  ctx: AudioContext,
  module: Rnnoise,
  { bufferSize, channels }: { bufferSize: number; channels: number }
) => {
  const processor = createProcessor(module, { bufferSize, channels })

  const node = createScriptProcessorNode(
    ctx,
    processor.process,
    bufferSize,
    channels,
    channels
  )

  return { node, destroy: processor.destroy }
}
