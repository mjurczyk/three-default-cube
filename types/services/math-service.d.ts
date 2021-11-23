export const MathService: MathServiceClass;
declare class MathServiceClass {
    poolVec2: any[];
    poolVec3: any[];
    poolQuaternions: any[];
    poolVec2Total: number;
    poolVec3Total: number;
    poolQuaternionsTotal: number;
    leakRegistry: {};
    getVec2(x: number, y: number, id: any): any;
    releaseVec2(vector: any): void;
    getQuaternion(id: any): any;
    releaseQuaternion(quaternion: any): void;
    getVec3(x: number, y: number, z: number, id: any): any;
    cloneVec3(sourceVector: any): any;
    releaseVec3(vector: any): void;
    registerId(object: any, id: any): void;
    unregisterId(object: any): void;
    handleLeaks(): void;
}
export {};
