import {
  SpeexPreprocessor,
  type SpeexModule
} from '@sapphi-red/speex-preprocess-wasm'
import type { Process } from '../utils/process'

export const createProcessor = (
  module: SpeexModule,
  {
    bufferSize,
    maxChannels,
    sampleRate
  }: { bufferSize: number; maxChannels: number; sampleRate: number }
) => {
  const preprocessors = Array.from(
    { length: maxChannels },
    () => new SpeexPreprocessor(module, bufferSize, sampleRate)
  )
  for (const preprocessor of preprocessors) {
    preprocessor.denoise = true
  }

  const getProperty = <K extends keyof SpeexPreprocessor>(
    k: K
  ): SpeexPreprocessor[K] => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return preprocessors[0]![k]
  }
  const setProperty = <K extends keyof SpeexPreprocessor>(
    k: K,
    v: SpeexPreprocessor[K]
  ) => {
    for (const preprocessor of preprocessors) {
      preprocessor[k] = v
    }
  }
  const destroy = () => {
    for (const preprocessor of preprocessors) {
      preprocessor.destroy()
    }
  }

  const process: Process = (input, output) => {
    const channels = Math.min(input.length, maxChannels)
    for (let i = 0; i < channels; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      preprocessors[i]!.process(input[i]!)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      output[i]!.set(input[i]!)
    }
  }

  return { process, getProperty, setProperty, destroy }
}
