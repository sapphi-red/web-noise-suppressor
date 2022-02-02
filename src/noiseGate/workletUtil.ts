import { type TypedAudioWorkletOptions } from '../utils/TypedAudioWorklet'
import { type NoiseGateProcessorOptions } from './options'

export const id = '@sapphi-red/web-noise-suppressor/noise-gate'

export type NoiseGateWorkletOptions = TypedAudioWorkletOptions<
  Required<NoiseGateProcessorOptions>
>
