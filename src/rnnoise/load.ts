import { simd } from 'wasm-feature-detect'
import { fetchArrayBuffer } from '../utils/fetchArrayBuffer'

type LoadRnnoiseOptions = {
  /**
   * url to regular wasm binary
   */
  url: string
  /**
   * url to simd wasm binary
   */
  simdUrl: string
}

export const loadRnnoise = async (
  { url, simdUrl }: LoadRnnoiseOptions,
  init?: RequestInit
) => {
  const loadUrl = (await simd()) ? simdUrl : url
  const binary = await fetchArrayBuffer(loadUrl, init)
  return binary
}
