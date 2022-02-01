export const getRms = (arr: Float32Array) => {
  let ave = 0
  for (const n of arr) {
    ave += n * n
  }
  return Math.sqrt(ave / arr.length)
}

export const convertDbToRms = (db: number) => Math.pow(10, db / 20)
