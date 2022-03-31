import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { createProcessor } from './processor'

test('processor should work', () => {
  const processor = createProcessor(
    {
      openThreshold: 10, // openThresholdRms: approx. 3.1
      closeThreshold: 8, // closeThresholdRms: approx. 2.5
      holdMs: 5,
      maxChannels: 1
    },
    10
  )

  const input1 = [new Float32Array(3).fill(1)] as const
  const output1 = [new Float32Array(3)] as const
  processor.process(input1, output1)
  assert.equal(output1, [new Float32Array(3)], 'close')

  const input2 = [new Float32Array(3).fill(4)] as const
  const output2 = [new Float32Array(3)] as const
  processor.process(input2, output2)
  assert.equal(output2, [new Float32Array(3).fill(4)], 'open')

  const input3 = [new Float32Array(3)] as const
  const output3 = [new Float32Array(3)] as const
  processor.process(input3, output3)
  processor.process(input3, output3)
  processor.process(input3, output3)
  assert.equal(output3, [new Float32Array(3)], 'closing -> close')

  const input4 = [new Float32Array(3).fill(1), new Float32Array(3).fill(4)]
  const output4 = [new Float32Array(3)] as const
  processor.process(input4, output4)
  assert.equal(output4, [new Float32Array(3)], 'maxChannel is working')
})

test.run()
