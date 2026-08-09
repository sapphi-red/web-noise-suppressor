import { loadGtcrnModule } from '@sapphi-red/gtcrn-wasm'
import type { Process } from '../utils/process'
import { createProcessor } from './processor'
import { id, type GtcrnWorkletOptions } from './workletUtil'

const AudioWorkletBufferSize = 128

class GtcrnWorkletProcessor extends AudioWorkletProcessor {
  private processor: { process: Process; destroy: () => void } | undefined
  private destroyed = false

  constructor(options: GtcrnWorkletOptions) {
    super()

    this.port.addEventListener('message', (e) => {
      if (e.data === 'destroy') {
        this.destroy()
      }
    })

    // load
    void (async () => {
      const gtcrnModule = await loadGtcrnModule({
        locateFile: (file: string) => file,
        wasmBinary: options.processorOptions.wasmBinary,
      })
      this.processor = createProcessor(gtcrnModule, {
        bufferSize: AudioWorkletBufferSize,
        maxChannels: options.processorOptions.maxChannels,
        sampleRate,
      })
      if (this.destroyed) {
        this.destroy()
      }
    })()
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], _parameters: unknown) {
    if (inputs.length === 0 || !inputs[0] || inputs[0]?.length === 0) {
      // no input connected
      return true
    }
    if (!this.processor) {
      // ignore because loading
      return true
    }

    this.processor.process(inputs[0], outputs[0]!)
    return true
  }

  private destroy() {
    this.destroyed = true
    this.processor?.destroy()
    this.processor = undefined
  }
}

registerProcessor(id, GtcrnWorkletProcessor)
