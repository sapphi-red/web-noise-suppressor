export const rafIter = (): AsyncIterableIterator<void> => {
  let id: number

  const obj = {
    async next() {
      const promise = new Promise(resolve => {
        requestAnimationFrame(resolve)
      })
      await promise
      return { value: undefined, done: false }
    },
    async return() {
      cancelAnimationFrame(id)
      return { value: undefined, done: true }
    },
    [Symbol.asyncIterator]() {
      return this
    }
  }

  return obj
}
