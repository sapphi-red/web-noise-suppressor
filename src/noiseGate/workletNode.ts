import type { NoiseGateProcessorOptions } from './options'
import { id, type NoiseGateWorkletOptions } from './workletUtil'

export class NoiseGateWorkletNode extends AudioWorkletNode {
  constructor(
    context: AudioContext,
    {
      openThreshold,
      closeThreshold = openThreshold,
      holdMs,
      maxChannels
    }: Readonly<NoiseGateProcessorOptions>
  ) {
    const workletOptions: NoiseGateWorkletOptions = {
      processorOptions: { openThreshold, closeThreshold, holdMs, maxChannels }
    }
    super(context, id, workletOptions)
  }
}
