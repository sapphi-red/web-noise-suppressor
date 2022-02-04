export type NoiseGateProcessorOptions = {
  /**
   * threshold to open the gate in dB
   */
  openThreshold: number
  /**
   * threshold to close the gate in dB
   *
   * @default openThreshold
   */
  closeThreshold?: number
  /**
   * length of time to close the gate in milliseconds
   *
   * When the input sound is under the closeThreshold for this time, the gate will close.
   */
  holdMs: number
  /**
   * the number of channels
   */
  channels: number
}
