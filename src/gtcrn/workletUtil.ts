import type { TypedAudioWorkletOptions } from '../utils/TypedAudioWorklet'
import type { GtcrnProcessorOptions } from './options'

export const id = '@sapphi-red/web-noise-suppressor/gtcrn'

export type GtcrnWorkletOptions = TypedAudioWorkletOptions<GtcrnProcessorOptions>
