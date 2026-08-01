export const rafIter = (): AsyncIterableIterator<void> => {
  let id: number

  const obj = {
    async next() {
      const promise = new Promise((resolve) => {
        id = requestAnimationFrame(resolve)
      })
      await promise
      return { value: undefined, done: false }
    },
    // oxlint-disable-next-line typescript/require-await
    async return() {
      cancelAnimationFrame(id)
      return { value: undefined, done: true }
    },
    [Symbol.asyncIterator]() {
      return this
    },
  }

  return obj
}
