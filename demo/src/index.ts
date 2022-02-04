import {
  loadSpeex,
  SpeexWorkletNode,
  loadRnnoise,
  RnnoiseWorkletNode,
  NoiseGateWorkletNode
} from '@sapphi-red/web-noise-suppressor'
import speexWorkletPath from '@sapphi-red/web-noise-suppressor/dist/speex/workletProcessor?url'
import noiseGateWorkletPath from '@sapphi-red/web-noise-suppressor/dist/noiseGate/workletProcessor?url'
import rnnoiseWorkletPath from '@sapphi-red/web-noise-suppressor/dist/rnnoise/workletProcessor?url'
import { setupVisualizer } from './visualizer'

//
;(async () => {
  console.log('1: Setup...')
  const speexWasmBinary = await loadSpeex({ url: '/wasms/speex.wasm' })
  const rnnoiseWasmBinary = await loadRnnoise({
    url: '/wasms/rnnoise.wasm',
    simdUrl: '/wasms/rnnoise_simd.wasm'
  })
  console.log('1: Setup done')

  const $startButton = document.getElementById(
    'start-button'
  ) as HTMLButtonElement
  const $form = document.getElementById('form') as HTMLFormElement

  const $canvas = document.getElementById('canvas') as HTMLCanvasElement

  let moduleAdded = false
  let speex: SpeexWorkletNode | undefined
  let rnnoise: RnnoiseWorkletNode | undefined
  let noiseGate: NoiseGateWorkletNode | undefined
  let gain: GainNode | undefined
  let analyzer: AnalyserNode | undefined
  $form.addEventListener('submit', async e => {
    const ctx = new AudioContext()

    if (!moduleAdded) {
      moduleAdded = true

      await ctx.audioWorklet.addModule(speexWorkletPath)
      await ctx.audioWorklet.addModule(noiseGateWorkletPath)
      await ctx.audioWorklet.addModule(rnnoiseWorkletPath)
    }

    if (!analyzer) {
      analyzer = setupVisualizer($canvas, ctx)
    }

    e.preventDefault()
    $startButton.disabled = true
    ctx.resume()

    const formData = new FormData($form)
    const type = formData.get('type')
    const webRtcNoiseSuppression = formData.has('webrtc-noise')
    const webRtcEchoCancellation = formData.has('webrtc-echo')
    const enableVisualizer = formData.has('visualizer')

    console.log('2: Loading...')
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        noiseSuppression: webRtcNoiseSuppression,
        echoCancellation: webRtcEchoCancellation,
        autoGainControl: false
      }
    })
    const source = ctx.createMediaStreamSource(stream)
    console.log('2: Loaded')

    console.log('3: Start')
    speex?.destroy()
    speex?.disconnect()
    rnnoise?.destroy()
    rnnoise?.disconnect()
    noiseGate?.disconnect()
    gain?.disconnect()
    speex = new SpeexWorkletNode(ctx, {
      wasmBinary: speexWasmBinary,
      channels: 2
    })
    rnnoise = new RnnoiseWorkletNode(ctx, {
      wasmBinary: rnnoiseWasmBinary,
      channels: 2
    })
    noiseGate = new NoiseGateWorkletNode(ctx, {
      openThreshold: -50,
      closeThreshold: -60,
      holdMs: 90,
      channels: 2
    })
    gain = new GainNode(ctx, { gain: 1 })

    if (type === 'speex') {
      source.connect(speex)
      speex.connect(gain)
    } else if (type === 'rnnoise') {
      source.connect(rnnoise)
      rnnoise.connect(gain)
    } else if (type === 'noiseGate') {
      source.connect(noiseGate)
      noiseGate.connect(gain)
    } else {
      source.connect(gain)
    }

    analyzer.disconnect()
    if (enableVisualizer) {
      gain.connect(analyzer)
    }

    gain.connect(ctx.destination)

    $startButton.disabled = false
  })

  $startButton.disabled = false
})()
