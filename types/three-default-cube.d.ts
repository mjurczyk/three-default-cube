export var __esModule: boolean;
export const AiService: AiServiceClass;
export class AiWrapper {
    constructor(target?: any);
    target?: any;
    registerBehaviour(callback?: any): void;
    tickListener?: any;
    getAiBehaviour(): any;
    hasTargetNode(): boolean;
    targetNode?: any;
    getTargetNode(): any;
    setTargetNode(node?: any): void;
    targetNodeId?: any;
    getDistanceToTargetNode(): any;
    getGroundAngleToTargetNode(): any;
    findPathToTargetNode(): any[];
    path?: any[];
    getPathLength(): number;
    dispose(): void;
}
export namespace AnimationOverrideType {
    const _default: number;
    export { _default as default };
    export const noOverride: number;
    export const overrideIfExists: number;
    export const ignoreIfExists: number;
}
export const AnimationService: AnimationServiceClass;
export class AnimationWrapper {
    constructor(target?: any);
    target?: any;
    parseAnimations(): void;
    mixer?: any;
    playAnimation(name?: any, tweenDuration?: number, reset?: boolean, onFinish?: any): void;
    stopAnimation(name?: any, tweenDuration?: number): void;
    blendInAnimation(name?: any, blendWeight?: number): void;
    playAllAnimations(tweenDuration?: number): void;
    stopAllAnimations(tweenDuration?: number): void;
    dispose(): void;
}
export const AssetsService: AssetsServiceClass;
export namespace AudioChannelEnums {
    const ambientChannel: string;
    const globalChannel: string;
}
export const AudioService: AudioServiceClass;
export const CameraService: CameraServiceClass;
export namespace DebugFlags {
    const DEBUG_ENABLE: string;
    const DEBUG_LIVE: string;
    const DEBUG_LOG_MEMORY: string;
    const DEBUG_LOG_POOLS: string;
    const DEBUG_LOG_ASSETS: string;
    const DEBUG_ORBIT_CONTROLS: string;
    const DEBUG_SCROLL_VISIBLE: string;
    const DEBUG_TIME_LISTENERS: string;
    const DEBUG_SKINNING_SKELETONS: string;
    const DEBUG_ADS: string;
    const DEBUG_DISABLE_ADS: string;
    const DEBUG_STORAGE: string;
    const DEBUG_AI_NODES: string;
    const DEBUG_AI_TARGETS: string;
    const DEBUG_PHYSICS: string;
    const DEBUG_PHYSICS_DYNAMIC: string;
}
export const DummyDebug: DummyDebugClass;
export const GameInfoService: GameInfoServiceClass;
declare const GameObjectClass_base: any;
export class GameObjectClass extends GameObjectClass_base {
    [x: string]: any;
    onCreate(): void;
    dispose(): void;
}
export const InputService: InputServiceClass;
export namespace InteractionEnums {
    const eventClick: string;
    const eventDrag: string;
    const eventHold: string;
    const eventRelease: string;
    const eventLeave: string;
    const stateEnabled: string;
    const stateHovered: string;
    const stateClicked: string;
    const stateIntInactive: number;
    const stateIntActive: number;
    const stateIntPending: number;
}
export const InteractionsService: InteractionsServiceClass;
export function IntroFadeShader({ target }: {
    target?: any;
}): {
    uniforms: {
        tMap: {
            value?: any;
        };
        tDiffuse: {
            value?: any;
        };
        fTime: {
            value: number;
        };
    };
    vertexShader: string;
    fragmentShader: string;
    transparent?: boolean;
};
export class IntroView extends ViewClass {
    constructor(nextView?: any);
    nextView?: any;
    showPlaques(queue?: any, gameObjectRefs?: any): void;
    hidePlaques(plaque?: any, queue?: any, gameObjectRefs?: any): void;
    onPlaquesShown(): void;
}
export const MathService: MathServiceClass;
export const MathUtils: any;
export const MoneyService: MoneyServiceClass;
export namespace OcclusionStepEnum {
    const progressive: string;
}
export const ParserService: ParserServiceClass;
export const ParticleService: ParticleServiceClass;
export const PhysicsService: PhysicsServiceClass;
export class PhysicsWrapper {
    constructor(target?: any);
    target?: any;
    enableNavmaps(): void;
    simpleVelocity?: any;
    simpleGravity?: any;
    enableNoClip(): void;
    noClip?: boolean;
    disableNoClip(): void;
    enablePhysics(): void;
    enableDynamicCollisions(callback?: any): void;
    dynamicCollisions?: boolean;
    boundingBox?: any;
    disableDynamicCollisions(): void;
    disablePhysics(): void;
    getSimpleVelocity(): any;
    setSimpleVelocity(value?: any): void;
    onCollision(listener?: any): void;
    collisionListener?: any;
    dispose(): void;
}
export class Preloader extends GameObjectClass {
    constructor({ requireAssets, onComplete, spinnerTexture }?: {
        requireAssets?: any;
        onComplete?: any;
        spinnerTexture?: any;
    });
    spinnerTexture?: any;
    onLoaded(): void;
}
export const RenderService: RenderServiceClass;
export const SceneService: SceneServiceClass;
export class SceneServiceClass {
    parseScene({ target, navpath, actions, gameObjects, onCreate }: {
        target?: any;
        navpath?: any;
        actions?: any;
        gameObjects?: any;
        onCreate?: any;
    }): void;
    gameObjectRefs?: any;
    setBackground(texture?: any, spherical?: boolean): void;
    setEnvironment(hdri?: any): void;
    getEnvironment(): any;
    disposeAll(): void;
}
export class ScrollList extends GameObjectClass {
    constructor({ scrollSpeed, scrollTween }?: {
        scrollSpeed?: any;
        scrollTween?: any;
    });
    scrollSpeed?: any;
    scrollTween?: any;
    scrollHitbox?: any;
    scrollPositionX?: any;
    scrollPositionY?: any;
    add(object?: any): void;
    scrollMaxOffsetX: number;
    scrollMaxOffsetY: number;
}
export class SkinnedGameObject extends GameObjectClass {
    constructor(...args: any[]);
    mixer?: any;
    playAnimation(name?: any, tweenDuration?: number): void;
    stopAnimation(name?: any, tweenDuration?: number): void;
    blendInAnimation(name?: any, blendWeight?: number): void;
    playAllAnimations(tweenDuration?: number): void;
    stopAllAnimations(tweenDuration?: number): void;
}
export const StorageService: StorageServiceClass;
export const SystemService: SystemServiceClass;
export class Text extends GameObjectClass {
    constructor({ font, color, textAlign, fontSize, text, outlineWidth, outlineColor, alwaysOnTop }?: {
        font?: any;
        color?: any;
        textAlign?: any;
        fontSize?: any;
        text?: any;
        outlineWidth?: any;
        outlineColor?: any;
        alwaysOnTop?: any;
    });
    troikaText?: any;
}
export const TimeService: TimeServiceClass;
export const UiService: UiServiceClass;
export const UtilsService: UtilsServiceClass;
export const VarService: VarServiceClass;
export class ViewClass {
    onCreate(): void;
    onDispose(): void;
    dispose(): void;
}
export function animateDelay(x?: any, delay?: number): number;
export function animateLinear(x?: any, duration?: number, offset?: number): number;
export function animateLinearInverse(x?: any, duration?: number, offset?: number): number;
export function cloneValue(value?: any): any;
export function convertMaterialType(material?: any, targetType?: string): any;
export function createArrowHelper(container?: any, id?: any, vector?: any, origin?: any, color?: any): any;
export function createBoxHelper(container?: any, id?: any, box?: any): any;
export function createDefaultCube(container?: any, id?: any, { position, size, color }?: {
    position?: any;
    size?: any;
    color?: any;
}): any;
export function defaultTo(value?: any, defaultValue?: any): any;
export function fitToCamera(mesh?: any, camera?: any, preserveRatio?: boolean): void;
export function fitToScreen(mesh?: any, depth?: number, camera?: any, preserveRatio?: boolean): void;
export function forAllMaterialTextures(material?: any, callback?: any): void;
export function get3dScreenHeight(depth: number, camera?: any): number;
export function get3dScreenWidth(depth: number, camera?: any): number;
export function getRandomColor(): any;
export function getRandomElement(set?: any): any;
export function isDefined(value?: any): boolean;
export const math2Pi: number;
export const mathPi2: number;
export const mathPi4: number;
export const mathPi8: number;
export function moduloAngle(x?: any): number;
export function parse(object?: any, payload?: any): void;
export function parseIf(object?: any): void;
export function parseIfNot(object?: any): void;
export function parseLabel(object?: any): void;
export function parseMaterial(object?: any): void;
export function parseNavmap(object?: any): void;
export function parseRotateXYZ(object?: any): void;
export function parseScroll(object?: any, payload?: {
    scene?: any;
    scrollLists?: any;
}): void;
export function parseShader(object?: any): void;
export function parseShading(object?: any): void;
export function parseSlideshow(object?: any): void;
export function parseSurface(object?: any): void;
export function removePlaceholder(target?: any): void;
export function replacePlaceholder(target?: any, replacement?: any): void;
export function spliceRandomElement(set?: any): any;
export function swapVectors(vectorA?: any, vectorB?: any): void;
declare class AiServiceClass {
    registerAiNode(object?: any): void;
    getAiNodeById(id?: any): any;
    disposeAiNode(object?: any): void;
    aiNodes?: any;
    disposeAll(): void;
}
declare class AnimationServiceClass {
    initLoop(): void;
    frameListenerUid?: any;
    onStep({ dt, elapsedTime }: {
        dt?: any;
        elapsedTime?: any;
    }): void;
    animations?: any;
    registerAnimation({ target, onCreate, onStep, onDispose: customDispose, interval, override, randomSeed }?: {
        target?: any;
        onCreate?: any;
        onStep?: any;
        onDispose?: any;
        interval?: any;
        override?: number;
        randomSeed?: number;
    }): any;
    cancelAnimation(animation?: any): void;
    disposeAll(): void;
    dispose(): void;
}
declare class AssetsServiceClass {
    getDefaultCube(): any;
    getAmbientLight(groundColor?: number, skyColor?: number, intensity?: number): any;
    registerAsyncAsset(promisable?: any): any;
    getTexture(path?: any): any;
    getTextureSync(path?: any, then?: any): any;
    getImage(path?: any): any;
    getImageSync(path?: any, then?: any): any;
    getHDRI(path?: any, encoding?: any): any;
    getReflectionsTexture(path?: any): any;
    getModel(path?: any, { internalAllowPreloaded, forceUniqueMaterials, forceMaterialsType }?: {
        internalAllowPreloaded?: any;
        forceUniqueMaterials?: any;
        forceMaterialsType?: any;
    }): any;
    preloadModel(path?: any, { forceUniqueMaterials }?: {
        forceUniqueMaterials?: any;
    }): any;
    preloadFont(path?: any): any;
    preloadAudio(path?: any): any;
    getAudio(path?: any): any;
    getMaterial(name?: any): any;
    saveMaterial(material?: any): void;
    cloneMaterial(material?: any): any;
    cloneTexture(texture?: any): any;
    registerDisposeCallback(object?: any, dispose?: any): void;
    markDisposable(object?: any): void;
    markDisposed(object?: any): void;
    markUndisposed(object?: any, reason?: any): void;
    isDisposed(object?: any): any;
    willBeDisposed(object?: any): any;
    registerDisposable(object?: any): void;
    disposeAll(): void;
    disposables?: any;
    savedMaterials: {};
    audioBuffers: {};
    preloaded?: any[];
    pending: {};
    disposeAsset(object?: any): void;
    disposeProps(object?: any): void;
}
declare class AudioServiceClass {
    init(): void;
    setMasterVolume(volume?: number): void;
    getMasterVolume(): any;
    setAudioVolume(audio?: any, volume?: number): void;
    setAudioPlaybackRate(audio?: any, playbackRate?: number): void;
    setChannelVolume(channel?: any, volume?: number, tweenDuration?: number): void;
    setChannelPlaybackRate(channel?: any, playbackRate?: number): void;
    stopChannel(channel?: any): void;
    playAudio(channel?: any, audioOrPromised?: any, loop?: boolean): Promise<any>;
    stopAudio(sound?: any): void;
    resetAudio(): void;
    channels: {};
    disposeAll(): void;
}
declare class CameraServiceClass {
    init({ camera }?: {
        camera?: any;
    }): void;
    camera?: any;
    onFrame(): void;
    resetCamera(): void;
    updateCamera(): void;
    setCameraPosition(x?: any, y?: any, z?: any): void;
    setCameraQuaternion(quaternion?: any): void;
    copyCameraPosition(position?: any): void;
    copyCameraQuaternion(quaternion?: any): void;
    addCamera(id?: any, camera?: any): void;
    getCamera(id?: any): any;
    useCamera(camera?: any, instant?: boolean): void;
    follow(object?: any, onReachTarget?: any, freezeFrame?: boolean): void;
    followedObject?: any;
    followListener?: any;
    followPivot?: any;
    getFollowPivot(): any;
    stopFollowing(): void;
    getCameraAsTexture(id?: any, { width, height, minFilter, magFilter }?: {
        width?: any;
        height?: any;
        minFilter?: any;
        magFilter?: any;
    }): any;
    updateRenderTargets(): void;
    disposeRenderTarget(renderTarget?: any): void;
    preventOcclusion({ allowTransparent, faceTarget, collisionRadius, occlusionStep }?: {
        allowTransparent?: any;
        faceTarget?: any;
        collisionRadius?: any;
        occlusionStep?: any;
    }): void;
    occlusionTest?: boolean;
    occlusionSettings: {
        allowTransparent?: any;
        faceTarget?: boolean;
    } | {
        allowTransparent?: undefined;
        faceTarget?: undefined;
    };
    occlusionSphere?: any;
    occlusionStep?: any;
    allowOcclusion(): void;
    determineTargetVisibility(): void;
    detachCamera(): void;
    detachedControls?: any;
    reattachCamera(): void;
    lockTranslation(): void;
    translationLocked?: boolean;
    lockRotation(): void;
    rotationLocked?: boolean;
    unlockTranslation(): void;
    unlockRotation(): void;
    disposeCamera(id?: any): void;
    disposeAll(): void;
    cameras: {};
    renderTargets: {};
    cameraPosition?: any;
    followPivotPosition?: any;
    cameraQuaternion?: any;
    followThreshold: number;
    tween: number;
}
declare class DummyDebugClass {
    on(debugFlag?: any): void;
    off(debugFlag?: any): void;
    get(debugFlag?: any): any;
    showStats(): void;
    stats?: any;
    hideStats(): void;
    showLogs(): void;
    logs: HTMLDivElement;
    createLogLine(...logs: any[]): HTMLDivElement;
}
declare class GameInfoServiceClass {
    addConfig(config?: {}): GameInfoServiceClass;
    config?: any;
    system(fps?: number, pixelRatio?: number, antialiasing?: boolean, postprocessing?: boolean, sceneBackgroundDefault?: number, correctBlenderLights?: boolean): GameInfoServiceClass;
    vr(enabled?: boolean): GameInfoServiceClass;
    camera(fov?: number, near?: number, far?: number): GameInfoServiceClass;
    initialVars(vars?: {}): GameInfoServiceClass;
    vars(vars?: {}): GameInfoServiceClass;
    labels(language?: string, vars?: {}): GameInfoServiceClass;
    animation(id?: any, animation?: any): GameInfoServiceClass;
    font(id?: any, font?: any): GameInfoServiceClass;
    texture(id?: any, texture?: any): GameInfoServiceClass;
    model(id?: any, model?: any): GameInfoServiceClass;
    audio(id?: any, audio?: any): GameInfoServiceClass;
    shader(id?: any, shader?: any): GameInfoServiceClass;
    custom(key?: any, value?: any): GameInfoServiceClass;
}
declare class InputServiceClass {
    onKeyDown({ key: pressed }: {
        key?: any;
    }): void;
    onKeyUp({ key: released }: {
        key?: any;
    }): void;
    init(): void;
    key(key?: any): any;
    dispose(): void;
    keys: {};
}
declare class InteractionsServiceClass {
    init({ camera }?: {
        camera?: any;
    }): void;
    onTouchMove(event?: any): void;
    onTouchStart(event?: any): void;
    onTouchEnd(event?: any): void;
    onPointerMove(event?: any): void;
    onPointerDown(event?: any): void;
    onPointerUp(event?: any): void;
    camera?: any;
    addListeners(): void;
    useTouch?: boolean;
    startTouch({ pointer, touch }: {
        pointer?: any;
        touch?: any;
    }): void;
    dismissTouch({ pointer, touch }: {
        pointer?: any;
        touch?: any;
    }): void;
    moveTouch({ pointer, delta, touch }: {
        pointer?: any;
        delta?: any;
        touch?: any;
    }): void;
    registerListener(target?: any, eventType?: any, callback?: any): void;
    registerInvisibleListener(target?: any, eventType?: any, callback?: any): void;
    getHits({ pointer }: {
        pointer?: any;
    }): any;
    disposeListener(target?: any): void;
    listeners?: any;
    disposeListeners(): void;
    disposePointerListeners(): void;
    dispose(): void;
    touches?: any[];
    pointer?: any;
    delta?: any;
}
declare class MathServiceClass {
    getVec2(x: number, y: number, id?: any): any;
    releaseVec2(vector?: any): void;
    getQuaternion(id?: any): any;
    releaseQuaternion(quaternion?: any): void;
    getVec3(x: number, y: number, z: number, id?: any): any;
    cloneVec3(sourceVector?: any): any;
    releaseVec3(vector?: any): void;
    registerId(object?: any, id?: any): void;
    unregisterId(object?: any): void;
    handleLeaks(): void;
}
declare class MoneyServiceClass {
    platformId?: any;
    init(): Promise<any>;
    adsInitialised?: boolean;
    showAd(then?: () => void): Promise<any>;
}
declare class ParserServiceClass {
    parseModel({ target, navpath, actions, gameObjects, onCreate }: {
        target?: any;
        navpath?: any;
        actions?: any;
        gameObjects?: any;
        onCreate?: any;
    }): void;
}
declare class ParticleServiceClass {
    init(): void;
    registerParticleEmitter(object?: any, { particleObject, particleDensity, positionBase, rotationBase, scaleBase, positionJitter, rotationJitter, scaleJitter, spawnJitter, globalTransforms, onCreate, onFrame, onReset }?: {
        particleObject?: any;
        particleDensity?: any;
        positionBase?: any;
        rotationBase?: any;
        scaleBase?: any;
        positionJitter?: any;
        rotationJitter?: any;
        scaleJitter?: any;
        spawnJitter?: any;
        globalTransforms?: any;
        onCreate?: any;
        onFrame?: any;
        onReset?: any;
    }): {
        particleDensity?: any;
        positionBase?: any;
        rotationBase?: any;
        scaleBase?: any;
        positionJitter?: any;
        rotationJitter?: any;
        scaleJitter?: any;
        spawnJitter?: any;
        globalTransforms?: any;
        particles?: any[];
        root?: any;
        onFrame?: any;
        onReset?: any;
        active?: boolean;
    };
    createRandomParticle(pivot?: any, emitterProps?: any): void;
    getUniformBase(value?: any): any[];
    getUniformRandomness(value?: any): any[];
    disposeAll(): void;
    emitters?: any[];
}
declare class PhysicsServiceClass {
    init(): void;
    updateStaticBodies(): void;
    bodies?: any;
    updateDynamicBodies(): void;
    dynamicBodies?: any;
    registerBody(object?: any): void;
    registerDynamicCollisionBody(object?: any, collisionCallback?: any): void;
    maxDynamicBodySize?: any;
    registerNavmap(object?: any): void;
    enableNavmap(object?: any): void;
    navmaps?: any;
    disableNavmap(object?: any): void;
    updatePathfinder(): void;
    pathfinder?: any;
    pathfinedEnabled?: boolean;
    registerSurfaceHandler(surfaceType?: any, handlerClass?: any, onInteraction?: string, onEnter?: string, onLeave?: string): void;
    registerSurface(object?: any): void;
    getNavmaps(): any;
    disposeBody(object?: any): void;
    disposeNavmap(object?: any): void;
    disposeSurface(object?: any): void;
    surfaces?: any;
    disposeAll(): void;
    surfaceHandlers: {};
}
declare class RenderServiceClass {
    getScene(): any;
    getNativeCamera(): any;
    getRenderer(): any;
    init({ domElement, pixelRatio }?: {
        domElement?: any;
        pixelRatio?: any;
    }): void;
    camera?: any;
    scene?: any;
    renderer?: any;
    composer?: any;
    initEssentialServices(): void;
    initPostProcessing(): void;
    updatePostProcessingEffect(id?: any, values?: {}): void;
    resetPostProcessingEffect(id?: any): void;
    resetPostProcessing(): void;
    run(): void;
    renderView(viewInstance?: any): void;
    currentView?: any;
    onSystemFrame(): void;
    systemLoop: number;
    onAnimationFrame(): void;
    animationLoop: number;
    onResumed?: any;
    onPaused?: any;
    onResize(): void;
    getWindowSize(): {
        width: number;
        height: number;
        aspectRatio: number;
    };
    pauseRendering(whenPaused?: any): any;
    paused?: boolean;
    resumeRendering(whenResumed?: any): any;
    dispose(): void;
}
declare class StorageServiceClass {
    useNative?: boolean;
    init(): void;
    getAllKeys(): any;
    set(key?: any, value?: any): any;
    get(key?: any): any;
}
declare class SystemServiceClass {
    isCordova?: boolean;
    init({ statusBar }?: {
        statusBar?: any;
    }): void;
    hideStatusBar(): void;
    lockOrientation(orientation?: any): void;
    onReady(then?: any): void;
    disposeAll(): void;
    appStateListeners?: any[];
}
declare class TimeServiceClass {
    createTimeoutPromise(timeout?: number): any;
    registerFrameListener(onFrame?: any): any;
    registerIntervalListener(onIntervalStep?: any, intervalTime?: number): void;
    registerPersistentFrameListener(onFrame?: any): any;
    onFrame({ dt, elapsedTime }: {
        dt?: any;
        elapsedTime?: any;
    }): void;
    frameListeners?: any;
    disposeFrameListener(frameListener?: any): void;
    disposePersistentListener(uid?: any): void;
    disposeIntervalListener(intervalListener?: any, intervalTime?: any): void;
    disposeAll(): void;
    intervals: {};
}
declare class UiServiceClass {
    createUiScene(): any;
    registerUiElement(object?: any): void;
    isUiElement(object?: any): boolean;
    onFrame(): void;
    disposeAll(): void;
    uiElements?: any[];
    tween: number;
}
declare class UtilsServiceClass {
    getRaycaster(): any;
    releaseRaycaster(raycaster?: any): void;
    getBox3(): any;
    releaseBox3(box3?: any): void;
    getCamera(): any;
    releaseCamera(camera?: any): void;
    getEmpty(): any;
    releaseEmpty(object?: any): void;
    getBlankMaterial(): any;
    releaseBlankMaterial(material?: any): void;
    disposeAll(): void;
    poolEmpty?: any[];
    poolBlankMaterial?: any[];
    poolEmptyTotal: number;
    poolBlankMaterialTotal: number;
}
declare class VarServiceClass {
    init({ language }?: {
        language?: any;
    }): void;
    setVar(id?: any, value?: any): void;
    getVar(id?: any, onUpdate?: any, onCreate?: any): any;
    removeVar(id?: any): void;
    registerPersistentVar(id?: any, defaultValue?: any): any;
    retrievePersistentVars(): any;
    resolveVar(variableString?: any, onResolve?: any, onCreate?: any): any;
    disposeListener(id?: any, callback?: any): void;
    disposeListeners(): void;
    listeners: {};
}
export {};
