export namespace AudioChannelEnums {
    const ambientChannel: string;
    const globalChannel: string;
}
export const AudioService: AudioServiceClass;
declare class AudioServiceClass {
    channels: {};
    init(): void;
    setMasterVolume(volume?: number): void;
    getMasterVolume(): any;
    setAudioVolume(audio: any, volume?: number): void;
    setAudioPlaybackRate(audio: any, playbackRate?: number): void;
    setChannelVolume(channel: any, volume?: number, tweenDuration?: number): void;
    setChannelPlaybackRate(channel: any, playbackRate?: number): void;
    stopChannel(channel: any): void;
    playAudio(channel: any, audioOrPromised: any, loop?: boolean): Promise<any>;
    stopAudio(sound: any): void;
    resetAudio(): void;
    disposeAll(): void;
}
export {};
