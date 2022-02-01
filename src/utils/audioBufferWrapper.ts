export const wrapAudioBufferAsArray = (buff: AudioBuffer) =>
  new Proxy(buff, {
    get(target, p, receiver) {
      if (typeof p === 'string' && parseInt(p, 10) + '' === p) {
        return target.getChannelData(+p)
      }
      return Reflect.get(target, p, receiver)
    }
  }) as unknown as ArrayLike<Float32Array>
