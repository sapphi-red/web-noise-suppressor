import { Rnnoise } from '@shiguredo/rnnoise-wasm'
import type { Process } from '../utils/process'
import { createProcessor } from './processor'
import { id, type RnnoiseWorkletOptions } from './workletUtil'

const AudioWorkletBufferSize = 128

class SpeexWorkletProcessor extends AudioWorkletProcessor {
  private processor: { process: Process; destroy: () => void } | undefined
  private destroyed = false

  constructor(options: RnnoiseWorkletOptions) {
    super()

    this.port.addEventListener('message', e => {
      if (e.data === 'destroy') {
        this.destroy()
      }
    })

    // load
    ;(async () => {
      const rnnoiseModule = await Rnnoise.loadBinary(
        options.processorOptions.wasmBinary
      )
      this.processor = createProcessor(rnnoiseModule, {
        bufferSize: AudioWorkletBufferSize,
        maxChannels: options.processorOptions.maxChannels
      })
      if (this.destroyed) {
        this.destroy()
      }
    })()
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _parameters: unknown
  ) {
    if (inputs.length === 0 || !inputs[0] || inputs[0]?.length === 0) {
      // no input connected
      return true
    }
    if (!this.processor) {
      // ignore because loading
      return true
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.processor.process(inputs[0]!, outputs[0]!)
    return true
  }

  private destroy() {
    this.destroyed = true
    this.processor?.destroy()
    this.processor = undefined
  }
}

registerProcessor(id, SpeexWorkletProcessor)
