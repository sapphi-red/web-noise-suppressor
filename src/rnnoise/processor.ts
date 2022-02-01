import { type Rnnoise } from '@shiguredo/rnnoise-wasm'
import { toF16FromF32, toF32FromF16 } from '../utils/f16'
import { Float32Slice } from '../utils/Float32Slice'
import { type Process } from '../utils/process'

const createSingleProcessor = (module: Rnnoise, bufferSize: number) => {
  const denoiseState = module.createDenoiseState()
  const frameSize = module.frameSize

  const processFrame = (frame: Float32Array) => {
    toF16FromF32(frame)
    denoiseState.processFrame(frame)
    toF32FromF16(frame)
  }

  let first = true
  const totalInputBuffer = new Float32Slice(bufferSize * 2 + frameSize)
  const totalOutputBuffer = new Float32Slice(bufferSize * 2 + frameSize)
  const rnnoiseInput = new Float32Array(frameSize)

  return {
    process: (inputBuffer: Float32Array, outputBuffer: Float32Array) => {
      totalInputBuffer.append(inputBuffer)
      if (first) {
        first = false
        return
      }

      let i = 0
      for (; i + frameSize < totalInputBuffer.length; i += frameSize) {
        rnnoiseInput.set(totalInputBuffer.subarray(i, i + frameSize))
        processFrame(rnnoiseInput)
        totalOutputBuffer.append(rnnoiseInput)
      }
      totalInputBuffer.shiftMany(i)

      totalOutputBuffer.shiftMany(bufferSize, outputBuffer)
    },
    destroy: () => {
      denoiseState.destroy()
    }
  }
}

export const createProcessor = (
  module: Rnnoise,
  { bufferSize, channels }: { bufferSize: number; channels: number }
) => {
  if (module.frameSize > bufferSize) {
    throw new Error(
      `bufferSize must be more than or equal to ${module.frameSize}.`
    )
  }

  const processors = Array.from({ length: channels }, () =>
    createSingleProcessor(module, bufferSize)
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
    for (let i = 0; i < channels; i++) {
      processors[i]!.process(input[i]!, output[i]!)
    }
  }

  return { process, destroy }
}
