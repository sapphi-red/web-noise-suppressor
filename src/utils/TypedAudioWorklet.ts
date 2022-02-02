export type TypedAudioWorkletOptions<T> = Omit<
  AudioWorkletNodeOptions,
  'processorOptions'
> & {
  processorOptions: T
}
