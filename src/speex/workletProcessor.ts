import { loadSpeexModule } from '@sapphi-red/speex-preprocess-wasm'
import { type Process } from '../utils/process'
import { createProcessor } from './processor'
import { id, type SpeexWorkletOptions } from './workletUtil'

const AudioWorkletBufferSize = 128

class SpeexWorkletProcessor extends AudioWorkletProcessor {
  private processor: { process: Process; destroy: () => void } | undefined
  private destroyed = false

  constructor(options: SpeexWorkletOptions) {
    super()

    this.port.addEventListener('message', e => {
      if (e.data === 'destroy') {
        this.destroy()
      }
    })

    // load
    ;(async () => {
      const speexModule = await loadSpeexModule({
        locateFile: (file: string) => file,
        wasmBinary: options.processorOptions.wasmBinary
      })
      this.processor = createProcessor(speexModule, {
        bufferSize: AudioWorkletBufferSize,
        channels: options.processorOptions.channels,
        sampleRate: sampleRate
      })
      if (this.destroyed) {
        this.destroy()
      }
    })()
    // TODO: getProperty, setProperty
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

// @ts-expect-error seems like registerProcessor type is broken
registerProcessor(id, SpeexWorkletProcessor)
