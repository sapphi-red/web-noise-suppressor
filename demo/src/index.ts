import {
  loadSpeex,
  SpeexWorkletNode,
  loadRnnoise,
  RnnoiseWorkletNode,
  NoiseGateWorkletNode
} from '@sapphi-red/web-noise-suppressor'
import speexWorkletPath from '@sapphi-red/web-noise-suppressor/speexWorklet.js?url'
import noiseGateWorkletPath from '@sapphi-red/web-noise-suppressor/noiseGateWorklet.js?url'
import rnnoiseWorkletPath from '@sapphi-red/web-noise-suppressor/rnnoiseWorklet.js?url'
import { setupVisualizer } from './visualizer'
import speexWasmPath from '@sapphi-red/web-noise-suppressor/speex.wasm?url'
import rnnoiseWasmPath from '@sapphi-red/web-noise-suppressor/rnnoise.wasm?url'
import rnnoiseWasmSimdPath from '@sapphi-red/web-noise-suppressor/rnnoise_simd.wasm?url'

const pageParam = new URLSearchParams(location.search)

const sampleRateParam = pageParam.get('sample-rate') ?? 'NaN'
const sampleRateParamNum = +sampleRateParam
const sampleRate = Number.isNaN(sampleRateParamNum)
  ? undefined
  : sampleRateParamNum

const sampleRateOptions = document.querySelectorAll<HTMLInputElement>(
  '[type="radio"][name="webrtc-sampleRate"]'
)
for (const sampleRateOption of sampleRateOptions) {
  sampleRateOption.checked = sampleRateOption.value === sampleRateParam
  sampleRateOption.addEventListener('click', () => {
    pageParam.set('sample-rate', sampleRateOption.value)
    location.search = pageParam.toString()
  })
}

//
;(async () => {
  const ctx = new AudioContext({ sampleRate })

  console.log('1: Setup...')
  const speexWasmBinary = await loadSpeex({ url: speexWasmPath })
  const rnnoiseWasmBinary = await loadRnnoise({
    url: rnnoiseWasmPath,
    simdUrl: rnnoiseWasmSimdPath
  })
  await ctx.audioWorklet.addModule(speexWorkletPath)
  await ctx.audioWorklet.addModule(noiseGateWorkletPath)
  await ctx.audioWorklet.addModule(rnnoiseWorkletPath)
  console.log('1: Setup done')

  const $startButton = document.getElementById(
    'start-button'
  ) as HTMLButtonElement
  const $form = document.getElementById('form') as HTMLFormElement
  const $canvas = document.getElementById('canvas') as HTMLCanvasElement
  const analyzer = setupVisualizer($canvas, ctx)

  let source: MediaStreamAudioSourceNode | undefined
  let speex: SpeexWorkletNode | undefined
  let rnnoise: RnnoiseWorkletNode | undefined
  let noiseGate: NoiseGateWorkletNode | undefined
  let gain: GainNode | undefined
  $form.addEventListener('submit', async e => {
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
    source?.disconnect()
    source = ctx.createMediaStreamSource(stream)
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
      maxChannels: 2
    })
    rnnoise = new RnnoiseWorkletNode(ctx, {
      wasmBinary: rnnoiseWasmBinary,
      maxChannels: 2
    })
    noiseGate = new NoiseGateWorkletNode(ctx, {
      openThreshold: -50,
      closeThreshold: -60,
      holdMs: 90,
      maxChannels: 2
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
