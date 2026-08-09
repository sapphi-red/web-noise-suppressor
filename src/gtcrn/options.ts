export type GtcrnProcessorOptions = {
  /**
   * the maximum number of channels
   */
  maxChannels: number
  /**
   * use `loadGtcrn` to obtain binary
   */
  wasmBinary: ArrayBuffer
}
