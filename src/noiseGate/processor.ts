import { type Process } from '../utils/process'
import { getRms } from '../utils/rms'
import { createOpenCloseStateMachine } from './openCloseStateMachine'
import { type NoiseGateProcessorOptions } from './options'

export const createProcessor = (
  {
    openThreshold,
    closeThreshold,
    holdMs,
    maxChannels
  }: Required<NoiseGateProcessorOptions>,
  bufferMs: number
) => {
  const openCloseStateMachine = createOpenCloseStateMachine({
    openThreshold,
    closeThreshold,
    holdMs,
    bufferMs
  })

  const process: Process = (input, output) => {
    const channels = Math.min(input.length, maxChannels)

    let inputAverage = 0
    for (let i = 0; i < channels; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      inputAverage += getRms(input[i]!) / channels
    }

    openCloseStateMachine.next(inputAverage)

    if (openCloseStateMachine.isOpen()) {
      for (let i = 0; i < channels; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        output[i]!.set(input[i]!)
      }
    }
  }

  return { process }
}
