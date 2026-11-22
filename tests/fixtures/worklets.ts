/// <reference types="vite/client" />

import gtcrnWasmUrl from '@sapphi-red/gtcrn-wasm/gtcrn.wasm?url'
import speexWasmUrl from '@sapphi-red/speex-preprocess-wasm/speex.wasm?url'
import rnnoiseWasmUrl from '@shiguredo/rnnoise-wasm/dist/rnnoise.wasm?url'
import rnnoiseSimdWasmUrl from '@shiguredo/rnnoise-wasm/dist/rnnoise_simd.wasm?url'
import { test } from 'vitest'
import gtcrnWorkletUrl from '../../src/gtcrn/workletProcessor.ts?url'
import {
  GtcrnWorkletNode,
  NoiseGateWorkletNode,
  RnnoiseWorkletNode,
  SpeexWorkletNode,
  loadGtcrn,
  loadRnnoise,
  loadSpeex,
} from '../../src'
import noiseGateWorkletUrl from '../../src/noiseGate/workletProcessor.ts?url'
import rnnoiseWorkletUrl from '../../src/rnnoise/workletProcessor.ts?url'
import speexWorkletUrl from '../../src/speex/workletProcessor.ts?url'

const sampleRate = 48000

const wasmWorklets = {
  Speex: {
    Node: SpeexWorkletNode,
    moduleUrl: speexWorkletUrl,
    load: () => loadSpeex({ url: speexWasmUrl }),
  },
  RNNoise: {
    Node: RnnoiseWorkletNode,
    moduleUrl: rnnoiseWorkletUrl,
    load: () => loadRnnoise({ url: rnnoiseWasmUrl, simdUrl: rnnoiseSimdWasmUrl }),
  },
  GTCRN: {
    Node: GtcrnWorkletNode,
    moduleUrl: gtcrnWorkletUrl,
    load: () => loadGtcrn({ url: gtcrnWasmUrl }),
  },
}

function createSource(context: BaseAudioContext, samples: Float32Array<ArrayBuffer>) {
  const source = context.createBufferSource()
  const input = context.createBuffer(1, samples.length, context.sampleRate)
  input.copyToChannel(samples, 0)
  source.buffer = input
  return source
}

function processorError(node: AudioWorkletNode, name: string) {
  return new Promise<never>((_, reject) => {
    node.addEventListener('processorerror', () => reject(new Error(`${name} processor failed`)), {
      once: true,
    })
  })
}

function rms(samples: Float32Array) {
  return Math.sqrt(samples.reduce((sum, sample) => sum + sample ** 2, 0) / samples.length)
}

export async function renderNoiseGate() {
  const segmentLength = 2048
  const samples = new Float32Array(2 * segmentLength)
  samples.fill(0.01, 0, segmentLength).fill(0.25, segmentLength)

  const context = new OfflineAudioContext(1, samples.length, sampleRate)
  await context.audioWorklet.addModule(noiseGateWorkletUrl)
  // The package accepts AudioContext in its types. The native node also accepts offline contexts.
  const gate = new NoiseGateWorkletNode(context as unknown as AudioContext, {
    openThreshold: -20,
    holdMs: 0,
    maxChannels: 1,
  })
  const source = createSource(context, samples)
  source.connect(gate).connect(context.destination)
  source.start()

  const rendered = await Promise.race([context.startRendering(), processorError(gate, 'NoiseGate')])
  const output = rendered.getChannelData(0)
  const quietSamples = output.subarray(0, segmentLength)
  const loudSamples = output.subarray(segmentLength)
  const quietPeak = quietSamples.reduce((peak, sample) => Math.max(peak, Math.abs(sample)), 0)
  return { quietPeak, loudRms: rms(loudSamples) }
}

export function testWasmWorklet(name: keyof typeof wasmWorklets) {
  return test.extend('worklet', async ({ onTestFinished }) => {
    const { Node, moduleUrl, load } = wasmWorklets[name]
    const wasmBinary = await load()

    // A fixed seed gives all three processors the same broadband noise on every run.
    const input = new Float32Array(sampleRate)
    let seed = 0x12345678
    for (let i = 0; i < input.length; i++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      input[i] = (seed / 0x100000000 - 0.5) * 0.2
    }

    // A real-time context lets WASM initialization finish during rendering.
    const options = { sampleRate, sinkId: { type: 'none' } } as const
    const context = new AudioContext(options)
    let workletError: Error | undefined
    onTestFinished(async () => {
      await context.close()
      if (workletError) throw workletError
    })

    await context.audioWorklet.addModule(moduleUrl)
    const node = new Node(context, { maxChannels: 1, wasmBinary })
    node.addEventListener(
      'processorerror',
      () => {
        workletError = new Error(`${name} processor failed`)
      },
      { once: true },
    )
    const analyser = new AnalyserNode(context, { fftSize: 8192 })
    const source = createSource(context, input)
    source.loop = true
    source.connect(node).connect(analyser).connect(context.destination)
    source.start()

    const output = new Float32Array(analyser.fftSize)
    function readOutputRms() {
      if (workletError) throw workletError
      analyser.getFloatTimeDomainData(output)
      return rms(output)
    }

    return {
      inputRms: rms(input),
      readOutputRms,
      measureSettledOutput: () => measureSettledOutput(context, readOutputRms),
      destroy: () => node.destroy(),
    }
  })
}

async function measureSettledOutput(context: AudioContext, readOutputRms: () => number) {
  const deadline = performance.now() + 5000
  let startedAt: number | undefined

  while (performance.now() < deadline) {
    await new Promise<number>((resolve) => requestAnimationFrame(resolve))
    const outputRms = readOutputRms()
    if (outputRms > 0) startedAt ??= context.currentTime
    // Allow a second of audio for the noise estimate to settle after initialization.
    if (startedAt !== undefined && context.currentTime >= startedAt + 1) return outputRms
  }

  throw new Error('Timed out waiting for the worklet to produce audio')
}
