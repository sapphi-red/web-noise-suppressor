import type { Rnnoise } from '@shiguredo/rnnoise-wasm'
import { toF16FromF32, toF32FromF16 } from '../utils/f16'
import type { Process } from '../utils/process'

const createSingleProcessor = (module: Rnnoise) => {
  const denoiseState = module.createDenoiseState()

  const processFrame = (frame: Float32Array) => {
    toF16FromF32(frame)
    denoiseState.processFrame(frame)
    toF32FromF16(frame)
  }

  const bufferSize = 128
  const frameSize = 480
  // "(Math.floor(frameSize / bufferSize) + 1) * bufferSize" is the first multiple of 128 after 480
  const delay =
    (Math.floor(frameSize / bufferSize) + 1) * bufferSize + bufferSize
  const totalBufferSize = 1920
  const totalBuffer = new Float32Array(totalBufferSize)

  let input = 0
  let pos = totalBufferSize - frameSize * 2

  return {
    process: (inputBuffer: Float32Array, outputBuffer: Float32Array) => {
      totalBuffer.set(inputBuffer, input)
      input = (input + bufferSize) % totalBufferSize

      // 128, 512, 1024, 1536 are the first multiple of 128 after a multiple of 480
      if (input === 128 || input === 512 || input === 1024 || input === 1536) {
        pos = (pos + frameSize) % totalBufferSize

        const rnnoiseInput = totalBuffer.subarray(pos, pos + frameSize)
        processFrame(rnnoiseInput)
      }
      const start = (input + (totalBufferSize - delay)) % totalBufferSize
      outputBuffer.set(totalBuffer.subarray(start, start + bufferSize))
    },
    destroy: () => {
      denoiseState.destroy()
    }
  }
}

export const createProcessor = (
  module: Rnnoise,
  { bufferSize, maxChannels }: { bufferSize: number; maxChannels: number }
) => {
  if (module.frameSize !== 480) {
    throw new Error(`rnnoise frameSize must be 480. (was ${module.frameSize})`)
  }
  if (bufferSize !== 128) {
    throw new Error(`bufferSize must be 128. (was ${bufferSize}).`)
  }

  const processors = Array.from({ length: maxChannels }, () =>
    createSingleProcessor(module)
  )
  const destroy = () => {
    for (const processor of processors) {
      processor.destroy()
    }
  }

  const process: Process = (
    input: ArrayLike<Float32Array>,
    output: ArrayLike<Float32Array>
  ) => {
    const channels = Math.min(input.length, maxChannels)
    for (let i = 0; i < channels; i++) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      processors[i]!.process(input[i]!, output[i]!)
    }
  }

  return { process, destroy }
}
