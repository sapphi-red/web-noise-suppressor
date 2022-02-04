# @sapphi-red/web-noise-suppressor

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
See demo source code.

- [demo source code](https://github.com/sapphi-red/web-noise-suppressor/blob/main/demo/src/index.ts)

Also you will need to copy files.
Use CopyWebpackPlugin or vite-plugin-static-copy or something simillar.

See [vite.config.ts used in demo](https://github.com/sapphi-red/web-noise-suppressor/blob/main/demo/vite.config.ts).
