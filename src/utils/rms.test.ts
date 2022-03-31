import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { getRms, convertDbToRms } from './rms'

test('getRms should work', async () => {
  const arr = new Float32Array([3, 4, 5])
  assert.equal(Math.round(getRms(arr) * 10), 41)
})

test('convertDbToRms should work', async () => {
  assert.equal(Math.round(convertDbToRms(5) * 100), 178)
})

test.run()
