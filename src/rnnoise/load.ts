import { simd } from 'wasm-feature-detect'
import { fetchArrayBuffer } from '../utils/fetchArrayBuffer'

export const loadRnnoise = async (
  {
    path,
    simdPath
  }: {
    path: string
    simdPath: string
  },
  init?: RequestInit
) => {
  const loadPath = (await simd()) ? simdPath : path
  const binary = await fetchArrayBuffer(loadPath, init)
  return binary
}
