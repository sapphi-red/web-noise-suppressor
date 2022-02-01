const getRms = (arr: Float32Array) => {
  let ave = 0
  for (const n of arr) {
    ave += n * n
  }
  return Math.sqrt(ave / arr.length)
}

const convertDbToRms = (db: number) => Math.pow(10, db / 20)

export const createNoiseGateProcessorNode = (
  ctx: AudioContext,
  {
    threshold,
    hold,
    bufferSize,
    channels
  }: { threshold: number; hold: number; bufferSize: number; channels: number }
) => {
  const rmsThreshold = convertDbToRms(threshold)
  let held = 0

  const node = ctx.createScriptProcessor(bufferSize, channels, channels)
  node.addEventListener('audioprocess', ({ inputBuffer, outputBuffer }) => {
    let inputAverage = 0
    for (let i = 0; i < channels; i++) {
      const input = inputBuffer.getChannelData(i)
      inputAverage += getRms(input) / channels
    }

    const overTheshold = rmsThreshold < inputAverage
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
