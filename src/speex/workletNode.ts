import type { SpeexProcessorOptions } from './options'
import { id, type SpeexWorkletOptions } from './workletUtil'

export class SpeexWorkletNode extends AudioWorkletNode {
  constructor(
    context: AudioContext,
    { maxChannels, wasmBinary }: Readonly<SpeexProcessorOptions>
  ) {
    const workletOptions: SpeexWorkletOptions = {
      processorOptions: { maxChannels, wasmBinary }
    }
    super(context, id, workletOptions)
  }

  destroy() {
    this.port.postMessage('destroy')
  }
}
