export const UtilsService: UtilsServiceClass;
declare class UtilsServiceClass {
    poolRaycaster: any[];
    poolBox3: any[];
    poolCamera: any[];
    poolEmpty: any[];
    poolBlankMaterial: any[];
    poolRaycasterTotal: number;
    poolBox3Total: number;
    poolCameraTotal: number;
    poolEmptyTotal: number;
    poolBlankMaterialTotal: number;
    getRaycaster(): any;
    releaseRaycaster(raycaster: any): void;
    getBox3(): any;
    releaseBox3(box3: any): void;
    getCamera(): any;
    releaseCamera(camera: any): void;
    getEmpty(): any;
    releaseEmpty(object: any): void;
    getBlankMaterial(): any;
    releaseBlankMaterial(material: any): void;
    disposeAll(): void;
}
export {};
