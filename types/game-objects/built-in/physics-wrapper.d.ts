export class PhysicsWrapper {
    constructor(target: any);
    target: any;
    simpleVelocity: any;
    simpleGravity: any;
    grounded: boolean;
    collisionListener: any;
    dynamicCollisions: boolean;
    boundingBox: any;
    noClip: boolean;
    surfaceCollisions: {};
    enableNavmaps(): void;
    enableNoClip(): void;
    disableNoClip(): void;
    enablePhysics(): void;
    enableDynamicCollisions(callback: any): void;
    disableDynamicCollisions(): void;
    disablePhysics(): void;
    getSimpleVelocity(): any;
    setSimpleVelocity(value: any): void;
    onCollision(listener: any): void;
    dispose(): void;
}
