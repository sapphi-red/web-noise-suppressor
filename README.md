# @sapphi-red/web-noise-suppressor

[![npm version](https://badge.fury.io/js/@sapphi-red%2Fweb-noise-suppressor.svg)](https://badge.fury.io/js/@sapphi-red%2Fweb-noise-suppressor) ![CI](https://github.com/sapphi-red/web-noise-suppressor/workflows/CI/badge.svg)

Noise suppressor nodes for Web Audio API.

[Demo](https://web-noise-suppressor.sapphi.red)

This package provides three noise suppression nodes.

- NoiseGateWorkletNode: A simple noise gate implementation
- RnnoiseWorkletNode: Based on [xiph/rnnoise](https://github.com/xiph/rnnoise)
  - Using [shiguredo/rnnoise-wasm](https://github.com/shiguredo/rnnoise-wasm)
- SpeexWorkletNode: Based on [xiph/speexdsp](https://github.com/xiph/speexdsp)'s `preprocess` function
  - Using [sapphi-red/speex-preprocess-wasm](https://github.com/sapphi-red/speex-preprocess-wasm)

**This package requires AudioWorklet to work.**

## Install

```shell
npm i @sapphi-red/web-noise-suppressor # yarn add @sapphi-red/web-noise-suppressor
```

## Usage

This section is written only for vite users.

```ts
import { SpeexWorkletNode, loadSpeex } from '@sapphi-red/web-noise-suppressor'
import speexWorkletPath from '@sapphi-red/web-noise-suppressor/speexWorklet.js?url'
import speexWasmPath from '@sapphi-red/web-noise-suppressor/speex.wasm?url' // you can use `vite-plugin-static-copy` instead of this

const ctx = new AudioContext()

const speexWasmBinary = await loadSpeex({ url: speexWasmPath })
await ctx.audioWorklet.addModule(speexWorkletPath)

const stream = await navigator.mediaDevices.getUserMedia({
  audio: true
})

const source = ctx.createMediaStreamSource(stream)
const speex = new SpeexWorkletNode(ctx, {
  wasmBinary: speexWasmBinary,
  maxChannels: 2
})

source.connect(speex)
speex.connect(ctx.destination)
```

For more details, see [demo source code](https://github.com/sapphi-red/web-noise-suppressor/blob/main/demo/src/index.ts).
