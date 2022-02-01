import { createScriptProcessorNode } from '../utils/scriptProcessor'
import { type NoiseGateProcessorNodeOptions } from './options'
import { createProcessor } from './processor'

export const createNoiseGateProcessorNode = (
  ctx: AudioContext,
  {
    openThreshold,
    closeThreshold = openThreshold,
    hold,
    bufferSize,
    channels
  }: NoiseGateProcessorNodeOptions
) => {
  const processor = createProcessor({
    openThreshold,
    closeThreshold,
    hold,
    channels
  })

  const node = createScriptProcessorNode(
    ctx,
    processor.process,
    bufferSize,
    channels,
    channels
  )

  return { node }
}
