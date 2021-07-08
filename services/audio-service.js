import * as Three from 'three';
import { Howler, Howl } from 'howler';
import { AssetsService } from './assets-service';

export const AudioChannelEnums = {
  ambientChannel: 'ambient',
  globalChannel: 'global',
};

class AudioServiceClass {
  channels = {};

  init() {
    Howler.autoUnlock = true;
  }
  
  setMasterVolume(volume = 1.0) {
    Howler.volume(volume);
  }

  getMasterVolume() {
    return Howler.volume();
  }

  setAudioVolume(audio, volume = 1.0) {
    if (!audio) {
      return;
    }

    audio.volume(volume);
  }

  setAudioPlaybackRate(audio, playbackRate = 1.0) {
    if (!audio) {
      return;
    }

    audio.rate(playbackRate);
  }

  setChannelVolume(channel, volume = 1.0, tweenDuration = 0.0) {
    if (!this.channels[channel]) {
      return;
    }

    if (tweenDuration) {
      this.channels[channel].fade(
        this.channels[channel].volume(),
        volume,
        tweenDuration * 1000
      );
    } else {
      this.channels[channel].volume(volume);
    }
  }

  setChannelPlaybackRate(channel, playbackRate = 1.0) {
    if (!this.channels[channel]) {
      return;
    }

    this.channels[channel].rate(playbackRate);
  }

  stopChannel(channel) {
    if (!this.channels[channel]) {
      return;
    }

    this.stopAudio(this.channels[channel]);

    this.channels[channel] = null;
  }

  async playAudio(channel, audioOrPromised, loop = false) {
    if (!audioOrPromised) {
      return;
    }

    if (channel && this.channels[channel]) {
      this.stopAudio(this.channels[channel]);

      this.channels[channel] = null;
    }

    const audio = await audioOrPromised;
    audio.loop(loop || (channel && channel === AudioChannelEnums.ambientChannel));
    audio.mute(false);
    audio.play();

    if (channel) {
      this.channels[channel] = audio;
    }

    return audio;
  }

  stopAudio(sound) {
    sound.stop();
    sound.mute();
    sound.unload();
  }

  resetAudio() {
    Object.keys(this.channels).forEach(key => {
      const sound = this.channels[key];

      AssetsService.registerDisposable(sound);
      this.stopAudio(sound);
    });

    this.channels = {};
  }

  disposeAll() {
    this.resetAudio();
  }
}

export const AudioService = new AudioServiceClass();