import { NoiseGateProcessorOptions } from './options'
import { id, type NoiseGateWorkletOptions } from './workletUtil'

export class NoiseGateWorkletNode extends AudioWorkletNode {
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
