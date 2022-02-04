import { fetchArrayBuffer } from '../utils/fetchArrayBuffer'

type LoadSpeexOptions = {
  /**
   * url to wasm binary
   */
  url: string
}

export const loadSpeex = async (
  { url }: LoadSpeexOptions,
  init?: RequestInit
) => {
  const binary = await fetchArrayBuffer(url, init)
  return binary
}
