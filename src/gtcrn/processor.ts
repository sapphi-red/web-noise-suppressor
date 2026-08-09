import {
  GtcrnProcessor,
  SAMPLE_RATE,
  SAMPLE_RATE_48K,
  type GtcrnModule,
} from '@sapphi-red/gtcrn-wasm'
import type { Process } from '../utils/process'

const createSingleProcessor = (module: GtcrnModule, sampleRate: number, bufferSize: number) => {
  const processor = new GtcrnProcessor(module, {
    sampleRate: sampleRate === SAMPLE_RATE_48K ? SAMPLE_RATE_48K : SAMPLE_RATE,
  })
  const frameSize = processor.frameSize
  const buffersPerFrame = frameSize / bufferSize

  if (frameSize % bufferSize !== 0) {
    throw new Error(
      `GTCRN frame size must be divisible by bufferSize. (was ${frameSize}/${bufferSize}).`,
    )
  }

  const frame = new Float32Array(frameSize)
  const denoised = new Float32Array(frameSize)
  let inputPhase = 0
  let outputPhase = buffersPerFrame - 1

  return {
    process: (inputBuffer: Float32Array, outputBuffer: Float32Array) => {
      frame.set(inputBuffer, inputPhase * bufferSize)
      if (inputPhase === buffersPerFrame - 1) {
        denoised.set(processor.process(frame))
        outputBuffer.set(denoised.subarray(0, bufferSize))
        outputPhase = 1 % buffersPerFrame
      } else {
        const outputStart = outputPhase * bufferSize
        outputBuffer.set(denoised.subarray(outputStart, outputStart + bufferSize))
        outputPhase = (outputPhase + 1) % buffersPerFrame
      }
      inputPhase = (inputPhase + 1) % buffersPerFrame
    },
    destroy: () => {
      processor.destroy()
    },
  }
}

export const createProcessor = (
  module: GtcrnModule,
  {
    bufferSize,
    maxChannels,
    sampleRate,
  }: { bufferSize: number; maxChannels: number; sampleRate: number },
) => {
  if (bufferSize !== 128) {
    throw new Error(`bufferSize must be 128. (was ${bufferSize}).`)
  }

  if (sampleRate !== SAMPLE_RATE && sampleRate !== SAMPLE_RATE_48K) {
    throw new Error(
      `GTCRN supports only ${SAMPLE_RATE}Hz and ${SAMPLE_RATE_48K}Hz. (was ${sampleRate}Hz).`,
    )
  }

  const processors = Array.from({ length: maxChannels }, () =>
    createSingleProcessor(module, sampleRate, bufferSize),
  )
  const destroy = () => {
    for (const processor of processors) {
      processor.destroy()
    }
  }

  const process: Process = (input: ArrayLike<Float32Array>, output: ArrayLike<Float32Array>) => {
    const channels = Math.min(input.length, maxChannels)
    for (let i = 0; i < channels; i++) {
      processors[i]!.process(input[i]!, output[i]!)
    }
  }

  return { process, destroy }
}
