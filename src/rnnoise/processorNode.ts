import { type Rnnoise } from '@shiguredo/rnnoise-wasm'
import { createProcessor } from './processor'

export const createRnnoiseProcessorNode = (
  ctx: AudioContext,
  module: Rnnoise,
  { bufferSize, channels }: { bufferSize: number; channels: number }
) => {
  if (module.frameSize > bufferSize) {
    throw new Error(
      `bufferSize must be more than or equal to ${module.frameSize}.`
    )
  }

  const processors = Array.from({ length: channels }, () =>
    createProcessor(module, bufferSize)
  )
  const destroy = () => {
    for (const processor of processors) {
      processor.destroy()
    }
  }

  const node = ctx.createScriptProcessor(bufferSize, channels, channels)
  node.addEventListener('audioprocess', ({ inputBuffer, outputBuffer }) => {
    for (let i = 0; i < channels; i++) {
      const input = inputBuffer.getChannelData(i)
      const output = outputBuffer.getChannelData(i)
      processors[i]!.process(input, output)
    }
  })

  return { node, destroy }
}
