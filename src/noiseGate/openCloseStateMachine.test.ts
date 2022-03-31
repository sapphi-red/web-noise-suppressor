import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { createOpenCloseStateMachine } from './openCloseStateMachine'

test('openCloseStateMachine should work', () => {
  const sm = createOpenCloseStateMachine({
    openThreshold: 10, // openThresholdRms: approx. 3.1
    closeThreshold: 8, // closeThresholdRms: approx. 2.5
    holdMs: 5,
    bufferMs: 10
  })

  sm.next(0)
  assert.is(sm.isOpen(), false, 'CLOSED (1)')
  sm.next(0)
  assert.is(sm.isOpen(), false, 'CLOSED (2)')
  sm.next(4) // > openThresholdRms
  assert.is(sm.isOpen(), true, 'CLOSED -> OPEN')
  sm.next(4) // > openThresholdRms
  assert.is(sm.isOpen(), true, 'OPEN')
  sm.next(2) // < closeThresholdRms
  assert.is(sm.isOpen(), true, 'OPEN -> CLOSING: held 0')
  sm.next(2) // < closeThresholdRms
  assert.is(sm.isOpen(), true, 'CLOSING: held 1')
  sm.next(4) // > openThresholdRms
  assert.is(sm.isOpen(), true, 'CLOSING -> OPEN')
  sm.next(2) // < closeThresholdRms
  assert.is(sm.isOpen(), true, 'OPEN -> CLOSING: held 0')
  sm.next(2) // < closeThresholdRms
  assert.is(sm.isOpen(), true, 'CLOSING: held 1')
  sm.next(2) // < closeThresholdRms
  assert.is(sm.isOpen(), true, 'CLOSING -> CLOSED: held 2')
})

test.run()
