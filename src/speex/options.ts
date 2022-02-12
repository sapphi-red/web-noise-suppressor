export type SpeexProcessorOptions = {
  /**
   * the maximum number of channels
   */
  maxChannels: number
  /**
   * use `loadSpeex` to obtain binary
   */
  wasmBinary: ArrayBuffer
}
