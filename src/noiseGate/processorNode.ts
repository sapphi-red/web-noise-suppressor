import { getRms } from '../utils/rms'
import { createOpenCloseStateMachine } from './openCloseStateMachine'
import { type NoiseGateProcessorNodeOptions } from './options'

export const createNoiseGateProcessorNode = (
  ctx: AudioContext,
  {
    openThreshold,
    closeThreshold = openThreshold,
    hold,
    bufferSize,
    channels
  }: NoiseGateProcessorNodeOptions
) => {
  const openCloseStateMachine = createOpenCloseStateMachine({
    openThreshold,
    closeThreshold,
    hold
  })

  const node = ctx.createScriptProcessor(bufferSize, channels, channels)
  node.addEventListener('audioprocess', ({ inputBuffer, outputBuffer }) => {
    let inputAverage = 0
    for (let i = 0; i < channels; i++) {
      const input = inputBuffer.getChannelData(i)
      inputAverage += getRms(input) / channels
    }

    openCloseStateMachine.next(inputAverage)

    if (openCloseStateMachine.isOpen()) {
      for (let i = 0; i < channels; i++) {
        const input = inputBuffer.getChannelData(i)
        const output = outputBuffer.getChannelData(i)
        output.set(input)
      }
    }
  })

  return { node }
}
