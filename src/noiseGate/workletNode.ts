import { NoiseGateProcessorOptions } from './options'
import { id, type NoiseGateWorkletOptions } from './workletUtil'

export class NoiseGateWorkletNode extends AudioWorkletNode {
  constructor(
    context: AudioContext,
    options: Required<NoiseGateProcessorOptions>
  ) {
    const workletOptions: NoiseGateWorkletOptions = {
      processorOptions: options
    }
    super(context, id, workletOptions)
  }
}
