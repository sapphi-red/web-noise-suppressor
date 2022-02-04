import { type Rnnoise } from '@shiguredo/rnnoise-wasm'
import { toF16FromF32, toF32FromF16 } from '../utils/f16'
import { Float32Slice } from '../utils/Float32Slice'
import { type Process } from '../utils/process'

const calcTotalBufferSize = (bufferSize: number, frameSize: number) => {
  let result = 0
  for (let i = 0; result < frameSize; i++) {
    result += bufferSize
  }
  return result
}

const createSingleProcessor = (module: Rnnoise, bufferSize: number) => {
  const denoiseState = module.createDenoiseState()
  const frameSize = module.frameSize

  const processFrame = (frame: Float32Array) => {
    toF16FromF32(frame)
    denoiseState.processFrame(frame)
    toF32FromF16(frame)
  }

  const totalBufferSize = calcTotalBufferSize(bufferSize, frameSize)

  const totalBuffer = new Float32Slice(totalBufferSize)
  const rnnoiseInput = new Float32Array(frameSize)

  return {
    process: (inputBuffer: Float32Array, outputBuffer: Float32Array) => {
      totalBuffer.append(inputBuffer)
      if (totalBuffer.length < totalBufferSize) {
        return
      }

      rnnoiseInput.set(totalBuffer.subarray(0, frameSize))
      processFrame(rnnoiseInput)
      outputBuffer.set(rnnoiseInput.subarray(0, bufferSize))
      totalBuffer.shiftMany(bufferSize)
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
  if (bufferSize > module.frameSize) {
    throw new Error(
      `bufferSize must be smaller than or equal to ${module.frameSize} (was ${bufferSize}).`
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
