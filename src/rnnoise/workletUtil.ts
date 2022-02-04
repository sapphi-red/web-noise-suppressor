import { type TypedAudioWorkletOptions } from '../utils/TypedAudioWorklet'
import { type RnnoiseProcessorOptions } from './options'

export const id = '@sapphi-red/web-noise-suppressor/rnnoise'

export type RnnoiseWorkletOptions = TypedAudioWorkletOptions<RnnoiseProcessorOptions>
