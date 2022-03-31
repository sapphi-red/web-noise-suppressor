import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { toF16FromF32, toF32FromF16 } from './f16'

test('toF16FromF32 should work', async () => {
  const arr = new Float32Array([5, 5, 5])
  toF16FromF32(arr)
  assert.equal(arr, new Float32Array([163835, 163835, 163835]))
})

test('toF32FromF16 should work', async () => {
  const arr = new Float32Array([163835, 163835, 163835])
  toF32FromF16(arr)
  assert.equal(arr, new Float32Array([5, 5, 5]))
})

test.run()
