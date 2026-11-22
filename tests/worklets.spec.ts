import { expect, test } from 'vitest'
import { renderNoiseGate, testWasmWorklet } from './fixtures/worklets'

test('NoiseGate mutes a quiet signal and passes a louder signal', async () => {
  const result = await renderNoiseGate()

  expect(result).toEqual({ quietPeak: 0, loudRms: expect.closeTo(0.25, 4) })
})

for (const name of ['Speex', 'RNNoise', 'GTCRN'] as const) {
  const wasmTest = testWasmWorklet(name)

  wasmTest(
    `${name} attenuates broadband noise and produces non-silent output`,
    async ({ worklet }) => {
      const outputRms = await worklet.measureSettledOutput()
      expect(outputRms).toBeGreaterThan(0.000001)
      expect(outputRms / worklet.inputRms).toBeLessThan(0.5)
    },
  )
}
