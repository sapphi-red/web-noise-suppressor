import { type SpeexProcessorOptions } from './options'
import { id, type SpeexWorkletOptions } from './workletUtil'

export class SpeexWorkletNode extends AudioWorkletNode {
  constructor(context: AudioContext, options: Required<SpeexProcessorOptions>) {
    const workletOptions: SpeexWorkletOptions = {
      processorOptions: options
    }
    super(context, id, workletOptions)
  }

  destroy() {
    this.port.postMessage('destroy')
  }
}
