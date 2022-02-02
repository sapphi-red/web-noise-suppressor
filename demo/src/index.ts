import {
  createSpeexWorkletNode,
  loadRnnoise,
  createRnnoiseProcessorNode,
  createNoiseGateWorkletNode
} from '@sapphi-red/web-noise-suppressor'
import speexWorkletPath from '@sapphi-red/web-noise-suppressor/dist/speex/workletProcessor?url'
import noiseGateWorkletPath from '@sapphi-red/web-noise-suppressor/dist/noiseGate/workletProcessor?url'
import { setupVisualizer } from './visualizer'
import { fetchArrayBuffer } from './utils'

//
;(async () => {
  const ctx = new AudioContext()

  console.log('1: Setup...')
  const speexWasmBinary = await fetchArrayBuffer('/wasms/speex.wasm')
  const rnnoiseModule = await loadRnnoise('/wasms/')
  await ctx.audioWorklet.addModule(speexWorkletPath)
  await ctx.audioWorklet.addModule(noiseGateWorkletPath)
  console.log('1: Setup done')

  const $startButton = document.getElementById(
    'start-button'
  ) as HTMLButtonElement
  const $form = document.getElementById('form') as HTMLFormElement

  const $canvas = document.getElementById('canvas') as HTMLCanvasElement
  const analyzer = setupVisualizer($canvas, ctx)

  let speex: AudioWorkletNode | undefined
  let rnnoise: { node: ScriptProcessorNode; destroy: () => void } | undefined
  let noiseGate: AudioWorkletNode | undefined
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
    const source = ctx.createMediaStreamSource(stream)
    console.log('2: Loaded')

    console.log('3: Start')
    speex?.disconnect()
    rnnoise?.node.disconnect()
    rnnoise?.destroy()
    noiseGate?.disconnect()
    gain?.disconnect()
    speex = createSpeexWorkletNode(ctx, speexWasmBinary, { channels: 2 }).node
    rnnoise = createRnnoiseProcessorNode(ctx, rnnoiseModule, {
      bufferSize: 512,
      channels: 2
    })
    const noiseGateO = createNoiseGateWorkletNode(ctx, {
      openThreshold: -50,
      closeThreshold: -60,
      hold: 30,
      channels: 2
    })
    noiseGate = noiseGateO.node
    gain = new GainNode(ctx, { gain: 1 })

    if (type === 'speex') {
      source.connect(speex)
      speex.connect(gain)
    } else if (type === 'rnnoise') {
      source.connect(rnnoise.node)
      rnnoise.node.connect(gain)
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
