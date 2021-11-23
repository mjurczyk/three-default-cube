export function animateLinearInverse(x: any, duration?: number, offset?: number): number;
export function animateLinear(x: any, duration?: number, offset?: number): number;
export function animateDelay(x: any, delay?: number): number;
export namespace AnimationOverrideType {
    const _default: number;
    export { _default as default };
    export const noOverride: number;
    export const overrideIfExists: number;
    export const ignoreIfExists: number;
}
export const AnimationService: AnimationServiceClass;
declare class AnimationServiceClass {
    animations: any[];
    frameListenerUid: any;
    initLoop(): void;
    onStep({ dt, elapsedTime }: {
        dt: any;
        elapsedTime: any;
    }): void;
    registerAnimation({ target, onCreate, onStep, onDispose: customDispose, interval, override, randomSeed }?: {
        target: any;
        onCreate: any;
        onStep: any;
        onDispose: any;
        interval: any;
        override?: number;
        randomSeed?: number;
    }): any;
    cancelAnimation(animation: any): void;
    disposeAll(): void;
    dispose(): void;
}
export {};
