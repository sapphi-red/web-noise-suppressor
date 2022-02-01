import { type Rnnoise } from '@shiguredo/rnnoise-wasm'
import { toF16FromF32, toF32FromF16 } from '../utils/f16'
import { Float32Slice } from '../utils/Float32Slice'

export const createProcessor = (module: Rnnoise, bufferSize: number) => {
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
