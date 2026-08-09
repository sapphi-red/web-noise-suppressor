import { fetchArrayBuffer } from '../utils/fetchArrayBuffer'

type LoadGtcrnOptions = {
  /**
   * url to wasm binary
   */
  url: string
}

export const loadGtcrn = async ({ url }: LoadGtcrnOptions, init?: RequestInit) => {
  const binary = await fetchArrayBuffer(url, init)
  return binary
}
