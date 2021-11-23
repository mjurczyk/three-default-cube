export const RenderService: RenderServiceClass;
declare class RenderServiceClass {
    systemClock: any;
    animationClock: any;
    animationDelta: number;
    camera: any;
    renderer: any;
    composer: any;
    postProcessingEffects: {};
    scene: any;
    controls: any;
    currentView: any;
    paused: boolean;
    onPaused: any;
    onResumed: any;
    animationLoop: any;
    systemLoop: any;
    getScene(): any;
    getNativeCamera(): any;
    getRenderer(): any;
    init({ domElement, pixelRatio }?: {
        domElement: any;
        pixelRatio: any;
    }): void;
    initEssentialServices(): void;
    initPostProcessing(): void;
    updatePostProcessingEffect(id: any, values?: {}): void;
    resetPostProcessingEffect(id: any): void;
    resetPostProcessing(): void;
    run(): void;
    renderView(viewInstance: any): void;
    onSystemFrame(): void;
    onAnimationFrame(): void;
    onResize(): void;
    getWindowSize(): {
        width: number;
        height: number;
        aspectRatio: number;
    };
    pauseRendering(whenPaused: any): any;
    resumeRendering(whenResumed: any): any;
    dispose(): void;
}
export {};
