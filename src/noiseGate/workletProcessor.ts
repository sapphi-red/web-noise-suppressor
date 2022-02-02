import { type Process } from '../utils/process'
import { createProcessor } from './processor'
import { id, type NoiseGateWorkletOptions } from './workletUtil'

class NoiseGateWorkletProcessor extends AudioWorkletProcessor {
  processor: { process: Process }

  constructor(options: NoiseGateWorkletOptions) {
    super()

    this.processor = createProcessor(options.processorOptions)
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    _parameters: unknown
  ) {
    this.processor.process(inputs[0]!, outputs[0]!)
    return true
  }
}

// @ts-expect-error
registerProcessor(id, NoiseGateWorkletProcessor)
