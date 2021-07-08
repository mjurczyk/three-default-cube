---
title: "AudioService"
draft: false
weight: 15
---

## AudioChannelEnums

```
{
  ambientChannel,
  globalChannel,
}
```

Ambient channel automatically loops the played sound.

## playAudio ()

```
playAudio(
  channel = null,
  audioOrPromised,
  loop = false
)
```

Plays Howler audio. If channel is not specified, plays the audio independently. Returns an audio reference.

## stopAudio ()

`stopAudio(audio)`

## setMasterVolume ()

`setMasterVolume(volume = 1.0)`

## getMasterVolume ()

`getMasterVolume()`

## setAudioVolume ()

`setAudioVolume(audio, volume = 1.0)`

## setAudioPlaybackRate ()

`setAudioPlaybackRate(audio, playbackRate = 1.0)`

## setChannelVolume ()

`setChannelVolume(channel, volume = 1.0, tweenDuration = 0.0)`

Sets specific channel volume. If tween is specified, channel fades to target volume.

## setChannelPlaybackRate ()

`setChannelPlaybackRate(channel, playbackRate = 1.0)`

## stopChannel ()

`stopChannel(channel)`
