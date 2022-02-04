export const fetchArrayBuffer = async (path: string, init?: RequestInit) => {
  const res = await fetch(path, init)
  const result = await res.arrayBuffer()
  return result
}
