import { type Process } from '../utils/process'
import { createProcessor } from './processor'
import { id, type NoiseGateWorkletOptions } from './workletUtil'

const AudioWorkletBufferSize = 128

class NoiseGateWorkletProcessor extends AudioWorkletProcessor {
  processor: { process: Process }

  constructor(options: NoiseGateWorkletOptions) {
    super()

    const bufferMs = (1000 / sampleRate) * AudioWorkletBufferSize

    this.processor = createProcessor(options.processorOptions, bufferMs)
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.processor.process(inputs[0]!, outputs[0]!)
    return true
  }
}

registerProcessor(id, NoiseGateWorkletProcessor)
