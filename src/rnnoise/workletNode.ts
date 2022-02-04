import { type RnnoiseProcessorOptions } from './options'
import { id, type RnnoiseWorkletOptions } from './workletUtil'

export class RnnoiseWorkletNode extends AudioWorkletNode {
  constructor(
    context: AudioContext,
    options: Required<RnnoiseProcessorOptions>
  ) {
    const workletOptions: RnnoiseWorkletOptions = {
      outputChannelCount: [options.channels],
      processorOptions: options
    }
    super(context, id, workletOptions)
  }

  destroy() {
    this.port.postMessage('destroy')
  }
}
