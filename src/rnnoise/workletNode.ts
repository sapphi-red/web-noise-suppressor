import type { RnnoiseProcessorOptions } from './options'
import { id, type RnnoiseWorkletOptions } from './workletUtil'

/**
 * Assumes sample rate to be 48kHz.
 */
export class RnnoiseWorkletNode extends AudioWorkletNode {
  constructor(
    context: AudioContext,
    { maxChannels, wasmBinary }: Readonly<RnnoiseProcessorOptions>
  ) {
    const workletOptions: RnnoiseWorkletOptions = {
      processorOptions: { maxChannels, wasmBinary }
    }
    super(context, id, workletOptions)
  }

  destroy() {
    this.port.postMessage('destroy')
  }
}
