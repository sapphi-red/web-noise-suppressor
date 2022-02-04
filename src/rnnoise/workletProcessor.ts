import { Rnnoise } from '@shiguredo/rnnoise-wasm'
import { type Process } from '../utils/process'
import { createProcessor } from './processor'
import { id, type RnnoiseWorkletOptions } from './workletUtil'

const AudioWorkletBufferSize = 128

class SpeexWorkletProcessor extends AudioWorkletProcessor {
  processor: { process: Process } | undefined

  constructor(options: RnnoiseWorkletOptions) {
    super()

    ;(async() => {
      const rnnoiseModule = await Rnnoise.loadBinary(options.processorOptions.wasmBinary)
      this.processor = createProcessor(rnnoiseModule, {
        bufferSize: AudioWorkletBufferSize,
        channels: options.processorOptions.channels
      })
    })()
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    _parameters: unknown
  ) {
    if (!this.processor) {
      // ignore because loading
      return true
    }

    this.processor.process(inputs[0]!, outputs[0]!)
    return true
  }
}

// @ts-expect-error
registerProcessor(id, SpeexWorkletProcessor)
