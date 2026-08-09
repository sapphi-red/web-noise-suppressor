import type { GtcrnProcessorOptions } from './options'
import { id, type GtcrnWorkletOptions } from './workletUtil'

export class GtcrnWorkletNode extends AudioWorkletNode {
  constructor(context: AudioContext, { maxChannels, wasmBinary }: Readonly<GtcrnProcessorOptions>) {
    const workletOptions: GtcrnWorkletOptions = {
      processorOptions: { maxChannels, wasmBinary },
    }
    super(context, id, workletOptions)
  }

  destroy() {
    this.port.postMessage('destroy')
  }
}
