import { NoiseGateProcessorOptions } from './options'
import { id, type NoiseGateWorkletOptions } from './workletUtil'

class NoiseGateWorkletNode extends AudioWorkletNode {
  constructor(
    context: AudioContext,
    options: Required<NoiseGateProcessorOptions>
  ) {
    const workletOptions: NoiseGateWorkletOptions = {
      outputChannelCount: [options.channels],
      processorOptions: options
    }
    super(context, id, workletOptions)
  }
}

export const createNoiseGateWorkletNode = (
  ctx: AudioContext,
  {
    openThreshold,
    closeThreshold = openThreshold,
    hold,
    channels
  }: NoiseGateProcessorOptions
) => {
  const node = new NoiseGateWorkletNode(ctx, {
    openThreshold,
    closeThreshold,
    hold,
    channels
  })
  return { node }
}
