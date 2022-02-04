export const fetchArrayBuffer = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, init)
  const result = await res.arrayBuffer()
  return result
}
