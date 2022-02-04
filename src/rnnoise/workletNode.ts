import { type RnnoiseProcessorOptions } from './options'
import { id, type RnnoiseWorkletOptions } from './workletUtil'

class RnnoiseWorkletNode extends AudioWorkletNode {
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
}

export const createRnnoiseWorkletNode = (
  ctx: AudioContext,
  wasmBinary: ArrayBuffer,
  { channels }: { channels: number }
) => {
  const node = new RnnoiseWorkletNode(ctx, {
    wasmBinary,
    channels
  })
  return { node }
}
