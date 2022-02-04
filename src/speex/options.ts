export type SpeexProcessorOptions = {
  /**
   * the number of channels
   */
  channels: number
  /**
   * use `loadSpeex` to obtain binary
   */
  wasmBinary: ArrayBuffer
}
