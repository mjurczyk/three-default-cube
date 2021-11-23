export namespace OcclusionStepEnum {
    const progressive: string;
}
export const CameraService: CameraServiceClass;
declare class CameraServiceClass {
    cameras: {};
    detachedControls: any;
    renderTargets: {};
    autoUpdateRenderTargets: boolean;
    cameraPosition: any;
    cameraQuaternion: any;
    defaultTween: number;
    tween: number;
    camera: any;
    followedObject: any;
    followListener: any;
    followThreshold: number;
    followPivot: any;
    followPivotPosition: any;
    occlusionTest: boolean;
    occlusionSettings: {};
    occlusionStep: string;
    occlusionSphere: number;
    translationLocked: boolean;
    rotationLocked: boolean;
    init({ camera }?: {
        camera: any;
    }): void;
    onFrame(): void;
    resetCamera(): void;
    updateCamera(): void;
    setCameraPosition(x: any, y: any, z: any): void;
    setCameraQuaternion(quaternion: any): void;
    copyCameraPosition(position: any): void;
    copyCameraQuaternion(quaternion: any): void;
    addCamera(id: any, camera: any): void;
    getCamera(id: any): any;
    useCamera(camera: any, instant?: boolean): void;
    follow(object: any, onReachTarget: any, freezeFrame?: boolean): void;
    getFollowPivot(): any;
    stopFollowing(): void;
    getCameraAsTexture(id: any, { width, height, minFilter, magFilter }?: {
        width: any;
        height: any;
        minFilter: any;
        magFilter: any;
    }): any;
    updateRenderTargets(): void;
    disposeRenderTarget(renderTarget: any): void;
    preventOcclusion({ allowTransparent, faceTarget, collisionRadius, occlusionStep }?: {
        allowTransparent: any;
        faceTarget: any;
        collisionRadius: any;
        occlusionStep: any;
    }): void;
    allowOcclusion(): void;
    determineTargetVisibility(): void;
    detachCamera(): void;
    reattachCamera(): void;
    lockTranslation(): void;
    lockRotation(): void;
    unlockTranslation(): void;
    unlockRotation(): void;
    disposeCamera(id: any): void;
    disposeAll(): void;
}
export {};
