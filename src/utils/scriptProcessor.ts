import { wrapAudioBufferAsArray } from './audioBufferWrapper'
import { Process } from './process'

export const createScriptProcessorNode = (
  ctx: AudioContext,
  process: Process,
  bufferSize?: number,
  numberOfInputChannels?: number,
  numberOfOutputChannels?: number
) => {
  const node = ctx.createScriptProcessor(
    bufferSize,
    numberOfInputChannels,
    numberOfOutputChannels
  )
  node.addEventListener('audioprocess', ({ inputBuffer, outputBuffer }) => {
    const input = wrapAudioBufferAsArray(inputBuffer)
    const output = wrapAudioBufferAsArray(outputBuffer)
    process(input, output)
  })
  return node
}
