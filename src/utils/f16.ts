export const toF16FromF32 = (arr: Float32Array) => {
  for (const [i, val] of arr.entries()) {
    arr[i] = val * 0x7fff
  }
}

export const toF32FromF16 = (arr: Float32Array) => {
  for (const [i, val] of arr.entries()) {
    arr[i] = val / 0x7fff
  }
}
