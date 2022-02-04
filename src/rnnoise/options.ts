export type RnnoiseProcessorOptions = {
  /**
   * the number of channels
   */
  channels: number
  /**
   * use `loadRnnoise` to obtain binary
   */
  wasmBinary: ArrayBuffer
}
