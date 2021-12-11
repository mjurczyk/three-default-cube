export class InstancedScene {
    constructor(sourceMesh: any, count: any);
    objects: any[];
    dirty: any[];
    root: any;
    onCreate(): void;
    addVirtualObject(object: any): void;
    markDirty(object: any): void;
    onFrame(): void;
    dispose(): void;
}
