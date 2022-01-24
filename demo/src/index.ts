import {
  loadSpeex,
  createSpeexProcessorNode
} from '@sapphi-red/web-noise-suppressor'

//
;(async () => {
  console.log('1: Setup...')
  const speexModule = await loadSpeex('/wasms/speex.wasm')
  console.log('1: Setup done')

  const $startButton = document.getElementById(
    'start-button'
  ) as HTMLButtonElement
  const $form = document.getElementById('form') as HTMLFormElement

  const ctx = new AudioContext()

  let speex: ScriptProcessorNode | undefined
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
        echoCancellation: webRtcEchoCancellation
      }
    })
    const source = ctx.createMediaStreamSource(stream)
    console.log('2: Loaded')

    console.log('3: Start')
    speex?.disconnect()
    gain?.disconnect()
    const speexs = createSpeexProcessorNode(ctx, speexModule, {
      bufferSize: 256,
      channels: 2
    })
    speex = speexs.node
    speexs.preprocessors.forEach(pp => {
      pp.denoise = true
    })
    gain = new GainNode(ctx, { gain: 1 })

    if (type === 'speex') {
      source.connect(speex)
      speex.connect(gain)
    } else {
      source.connect(gain)
    }
    gain.connect(ctx.destination)

    $startButton.disabled = false
  })

  $startButton.disabled = false
})()
