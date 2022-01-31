const getAbsAverage = (arr: Float32Array) => {
  let ave = 0
  for (const n of arr) {
    ave += Math.abs(n) / arr.length
  }
  return ave
}

export const createNoiseGateProcessorNode = (
  ctx: AudioContext,
  {
    theshold,
    hold,
    bufferSize,
    channels
  }: { theshold: number; hold: number; bufferSize: number; channels: number }
) => {
  const rawTheshold = Math.pow(10, theshold / 20)
  let held = 0

  const node = ctx.createScriptProcessor(bufferSize, channels, channels)
  node.addEventListener('audioprocess', ({ inputBuffer, outputBuffer }) => {
    let inputAverage = 0
    for (let i = 0; i < channels; i++) {
      const input = inputBuffer.getChannelData(i)
      inputAverage += getAbsAverage(input) / channels
    }

    const overTheshold = rawTheshold < inputAverage
    if (overTheshold) {
      held = 0
    } else if (held < hold) {
      held++
    } else {
      // do nothing
    }

    if (overTheshold || held < hold) {
      for (let i = 0; i < channels; i++) {
        const input = inputBuffer.getChannelData(i)
        const output = outputBuffer.getChannelData(i)
        output.set(input)
      }
    }
  })

  return { node }
}
