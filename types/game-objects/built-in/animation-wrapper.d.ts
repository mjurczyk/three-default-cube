export class AnimationWrapper {
    constructor(target: any);
    target: any;
    mixer: any;
    mixerActions: {};
    mixerClips: any[];
    parseAnimations(): void;
    playAnimation(name: any, tweenDuration: number, reset: boolean, onFinish: any): void;
    stopAnimation(name: any, tweenDuration?: number): void;
    blendInAnimation(name: any, blendWeight?: number): void;
    playAllAnimations(tweenDuration?: number): void;
    stopAllAnimations(tweenDuration?: number): void;
    dispose(): void;
}
