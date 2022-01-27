export class Float32Slice {
  private _length = 0
  private readonly _capacity
  private _array: Float32Array

  get length() {
    return this._length
  }
  get capacity() {
    return this._capacity
  }

  constructor(capacity: number) {
    this._array = new Float32Array(capacity)
    this._capacity = capacity
  }

  append(input: Float32Array) {
    const newLength = this._length + input.length
    if (newLength > this._capacity) {
      throw new Error(`Not enough capacity. (${newLength} > ${this._capacity})`)
    }

    this.set(input, this._length)
    this._length = newLength
  }

  shiftMany(size: number, output?: Float32Array) {
    if (this.length < size) {
      throw new Error(`Not enough length. (${this.length} < ${size})`)
    }

    output?.set(this.subarray(0, size))
    this.copyWithin(0, size)
    this._length -= size
  }

  set(array: ArrayLike<number>, offset?: number) {
    this._array.set(array, offset)
  }

  subarray(begin?: number, end?: number) {
    return this._array.subarray(begin, end)
  }

  copyWithin(target: number, start: number, end?: number) {
    this._array.copyWithin(target, start, end)
    return this
  }
}
