import { expect, test } from 'vitest'
import { getRms, convertDbToRms } from './rms'

test('getRms should work', () => {
  const arr = new Float32Array([3, 4, 5])
  expect(Math.round(getRms(arr) * 10)).toBe(41)
})

test('convertDbToRms should work', () => {
  expect(Math.round(convertDbToRms(5) * 100)).toBe(178)
})
