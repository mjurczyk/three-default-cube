---
title: "VI: Audio"
draft: false
weight: 7
---

## Howler vs Three.js Audio

**Note:** Default Cube does not support `Three.PositionalAudio` or Howler equivalent.

Three.js Audio, while an amazing API, does cause issues on specific Android devices after switching audio contexts. To prevent that, Default Cube uses Howler audio library.

## Independent Audio

To play a sound or music, use `AudioService.playAudio` without specifying the first argument (channel):

```js
AssetsService.getAudio(GameInfo.audio.bikeEngine).then(audio => {
  const audioContext = AudioService.playAudio(
    null, // NOTE Do not assign this audio clip to any channel
    audio,
    true // NOTE Specify whether the audio should loop
  );

  // NOTE You can control audio context directly using Howler API
  audioContext.play();
  audioContext.unmute();
});
```

## Channels

Default Cube gives you access to two global audio channels. Audio channel can be assigned an audio clip, and whenever a new one is assigned - the old one is automatically removed.

```js
AudioService.playAudio(AudioChannelEnums.global, forestMusicClip);

// NOTE AudioChannelEnums.ambient will automatically loop the audio clip
AudioService.playAudio(AudioChannelEnums.ambient, forestMusicClip);
```

Next: [Debugging](/intro/debugging/)
