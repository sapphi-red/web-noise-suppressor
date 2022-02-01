import {
  type SpeexModule,
  SpeexPreprocessor
} from '@sapphi-red/speex-preprocess-wasm'

export const createSpeexProcessorNode = (
  ctx: AudioContext,
  module: SpeexModule,
  { bufferSize, channels }: { bufferSize: number; channels: number }
) => {
  const preprocessors = Array.from(
    { length: channels },
    () => new SpeexPreprocessor(module, bufferSize, ctx.sampleRate)
  )
  for (const preprocessor of preprocessors) {
    preprocessor.denoise = true
  }

  const node = ctx.createScriptProcessor(bufferSize, channels, channels)
  node.addEventListener('audioprocess', ({ inputBuffer, outputBuffer }) => {
    for (let i = 0; i < channels; i++) {
      const input = inputBuffer.getChannelData(i)
      const output = outputBuffer.getChannelData(i)

      preprocessors[i]!.process(input)
      output.set(input)
    }
  })
  return { node, preprocessors }
}
