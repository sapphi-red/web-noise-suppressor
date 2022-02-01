import { SpeexPreprocessor } from '@sapphi-red/speex-preprocess-wasm'
import {
  loadSpeex,
  createSpeexProcessorNode,
  loadRnnoise,
  createRnnoiseProcessorNode,
  createNoiseGateProcessorNode
} from '@sapphi-red/web-noise-suppressor'
import { setupVisualizer } from './visualizer'

//
;(async () => {
  console.log('1: Setup...')
  const speexModule = await loadSpeex('/wasms/speex.wasm')
  const rnnoiseModule = await loadRnnoise('/wasms/')
  console.log('1: Setup done')

  const $startButton = document.getElementById(
    'start-button'
  ) as HTMLButtonElement
  const $form = document.getElementById('form') as HTMLFormElement

  const ctx = new AudioContext()

  const $canvas = document.getElementById('canvas') as HTMLCanvasElement
  const analyzer = setupVisualizer($canvas, ctx)

  let speexs:
    | {
        node: ScriptProcessorNode
        preprocessors: SpeexPreprocessor[]
      }
    | undefined
  let rnnoise: { node: ScriptProcessorNode; destroy: () => void } | undefined
  let noiseGate: ScriptProcessorNode | undefined
  let gain: GainNode | undefined
  $form.addEventListener('submit', async e => {
    e.preventDefault()
    $startButton.disabled = true
    ctx.resume()

    const formData = new FormData($form)
    const type = formData.get('type')
    const webRtcNoiseSuppression = formData.has('webrtc-noise')
    const webRtcEchoCancellation = formData.has('webrtc-echo')

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
    speexs?.node.disconnect()
    speexs?.preprocessors.forEach(pp => {
      pp.destroy()
    })
    rnnoise?.node.disconnect()
    rnnoise?.destroy()
    noiseGate?.disconnect()
    gain?.disconnect()
    speexs = createSpeexProcessorNode(ctx, speexModule, {
      bufferSize: 256,
      channels: 2
    })
    const speex = speexs.node
    speexs.preprocessors.forEach(pp => {
      pp.denoise = true
    })
    rnnoise = createRnnoiseProcessorNode(ctx, rnnoiseModule, {
      bufferSize: 512,
      channels: 2
    })
    const noiseGateO = createNoiseGateProcessorNode(ctx, {
      openThreshold: -50,
      closeThreshold: -60,
      hold: 30,
      bufferSize: 512,
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
    gain.connect(analyzer)
    gain.connect(ctx.destination)

    $startButton.disabled = false
  })

  $startButton.disabled = false
})()
