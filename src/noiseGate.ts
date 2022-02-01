const getRms = (arr: Float32Array) => {
  let ave = 0
  for (const n of arr) {
    ave += n * n
  }
  return Math.sqrt(ave / arr.length)
}

const convertDbToRms = (db: number) => Math.pow(10, db / 20)

export type NoiseGateProcessorNodeOptions = {
  openThreshold: number
  closeThreshold?: number
  hold: number
  bufferSize: number
  channels: number
}

const States = {
  CLOSED: 0,
  OPEN: 1,
  CLOSING: 2
} as const
type States = typeof States[keyof typeof States]

const createOpenCloseStateMachine = ({
  openThreshold,
  closeThreshold,
  hold
}: {
  openThreshold: number
  closeThreshold: number
  hold: number
}) => {
  const rmsOpenThreshold = convertDbToRms(openThreshold)
  const rmsCloseThreshold = convertDbToRms(closeThreshold)

  let state: States = States.CLOSED
  let held = 0

  const next = (rms: number) => {
    switch (state) {
      case States.CLOSED:
        if (rms > rmsOpenThreshold) {
          state = States.OPEN
        }
        break
      case States.OPEN:
        if (rms < rmsCloseThreshold) {
          state = States.CLOSING
          held = 0
        }
        break
      case States.CLOSING:
        if (rms > rmsCloseThreshold) {
          state = States.OPEN
        } else if (held > hold) {
          state = States.CLOSED
        } else {
          held++
        }
        break
      default:
        const exhaustiveCheck: never = state
        console.error(`Unknown state: ${exhaustiveCheck}`)
    }
  }
  const isOpen = () =>
    state === States.OPEN || state === States.CLOSING

  return { next, isOpen }
}

export const createNoiseGateProcessorNode = (
  ctx: AudioContext,
  {
    openThreshold,
    closeThreshold = openThreshold,
    hold,
    bufferSize,
    channels
  }: NoiseGateProcessorNodeOptions
) => {
  const openCloseStateMachine = createOpenCloseStateMachine({ openThreshold, closeThreshold, hold })

  const node = ctx.createScriptProcessor(bufferSize, channels, channels)
  node.addEventListener('audioprocess', ({ inputBuffer, outputBuffer }) => {
    let inputAverage = 0
    for (let i = 0; i < channels; i++) {
      const input = inputBuffer.getChannelData(i)
      inputAverage += getRms(input) / channels
    }

    openCloseStateMachine.next(inputAverage)

    if (openCloseStateMachine.isOpen()) {
      for (let i = 0; i < channels; i++) {
        const input = inputBuffer.getChannelData(i)
        const output = outputBuffer.getChannelData(i)
        output.set(input)
      }
    }
  })

  return { node }
}
