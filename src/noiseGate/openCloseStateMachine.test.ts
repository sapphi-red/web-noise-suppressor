import { expect, test } from 'vitest'
import { createOpenCloseStateMachine } from './openCloseStateMachine'

test('openCloseStateMachine should work', () => {
  const sm = createOpenCloseStateMachine({
    openThreshold: 10, // openThresholdRms: approx. 3.1
    closeThreshold: 8, // closeThresholdRms: approx. 2.5
    holdMs: 5,
    bufferMs: 10,
  })

  sm.next(0)
  expect(sm.isOpen(), 'CLOSED (1)').toBe(false)
  sm.next(0)
  expect(sm.isOpen(), 'CLOSED (2)').toBe(false)
  sm.next(4) // > openThresholdRms
  expect(sm.isOpen(), 'CLOSED -> OPEN').toBe(true)
  sm.next(4) // > openThresholdRms
  expect(sm.isOpen(), 'OPEN').toBe(true)
  sm.next(2) // < closeThresholdRms
  expect(sm.isOpen(), 'OPEN -> CLOSING: held 0').toBe(true)
  sm.next(2) // < closeThresholdRms
  expect(sm.isOpen(), 'CLOSING: held 1').toBe(true)
  sm.next(4) // > openThresholdRms
  expect(sm.isOpen(), 'CLOSING -> OPEN').toBe(true)
  sm.next(2) // < closeThresholdRms
  expect(sm.isOpen(), 'OPEN -> CLOSING: held 0').toBe(true)
  sm.next(2) // < closeThresholdRms
  expect(sm.isOpen(), 'CLOSING: held 1').toBe(true)
  sm.next(2) // < closeThresholdRms
  expect(sm.isOpen(), 'CLOSING -> CLOSED: held 2').toBe(true)
})
