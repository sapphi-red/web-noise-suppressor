export type RnnoiseProcessorOptions = {
  /**
   * the maximum number of channels
   */
  maxChannels: number
  /**
   * use `loadRnnoise` to obtain binary
   */
  wasmBinary: ArrayBuffer
}
