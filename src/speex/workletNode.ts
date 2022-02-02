import { id, type SpeexWorkletOptions } from './workletUtil'

class SpeexWorkletNode extends AudioWorkletNode {
  constructor(
    context: AudioContext,
    options: Required<{ wasmBinary: ArrayBuffer; channels: number }>
  ) {
    const workletOptions: SpeexWorkletOptions = {
      outputChannelCount: [options.channels],
      processorOptions: options
    }
    super(context, id, workletOptions)
  }
}

export const createSpeexWorkletNode = (
  ctx: AudioContext,
  wasmBinary: ArrayBuffer,
  { channels }: { channels: number }
) => {
  const node = new SpeexWorkletNode(ctx, {
    wasmBinary,
    channels
  })
  return { node }
}
