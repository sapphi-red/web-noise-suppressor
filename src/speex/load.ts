import { fetchArrayBuffer } from '../utils/fetchArrayBuffer'

export const loadSpeex = async (
  {
    path
  }: {
    path: string
  },
  init?: RequestInit
) => {
  const binary = await fetchArrayBuffer(path, init)
  return binary
}
