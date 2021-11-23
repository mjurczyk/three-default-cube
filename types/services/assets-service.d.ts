export const AssetsService: AssetsServiceClass;
declare class AssetsServiceClass {
    disposables: any[];
    pending: {};
    preloaded: {};
    savedMaterials: {};
    audioBuffers: {};
    getDefaultCube(): any;
    getAmbientLight(groundColor?: number, skyColor?: number, intensity?: number): any;
    registerAsyncAsset(promisable: any): any;
    getImage(path: any): any;
    getImageSync(path: any, then: any): any;
    getHDRI(path: any): any;
    getModel(path: any, { internalAllowPreloaded, forceUniqueMaterials, forceMaterialsType }?: {
        internalAllowPreloaded: any;
        forceUniqueMaterials: any;
        forceMaterialsType: any;
    }): any;
    preloadModel(path: any, { forceUniqueMaterials }?: {
        forceUniqueMaterials: any;
    }): any;
    preloadFont(path: any): any;
    preloadAudio(path: any): any;
    getAudio(path: any): any;
    getMaterial(name: any): any;
    saveMaterial(material: any): void;
    cloneMaterial(material: any): any;
    cloneTexture(texture: any): any;
    registerDisposeCallback(object: any, dispose: any): void;
    markDisposable(object: any): void;
    markDisposed(object: any): void;
    markUndisposed(object: any, reason: any): void;
    isDisposed(object: any): any;
    willBeDisposed(object: any): any;
    registerDisposable(object: any): void;
    disposeAll(): void;
    disposeAsset(object: any): void;
    disposeProps(object: any): void;
}
export {};
