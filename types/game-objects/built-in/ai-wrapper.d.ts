export class AiWrapper {
    constructor(target: any);
    target: any;
    targetNode: any;
    targetNodeId: number;
    tickListener: any;
    path: any[];
    registerBehaviour(callback: any): void;
    getAiBehaviour(): any;
    hasTargetNode(): boolean;
    getTargetNode(): any;
    setTargetNode(node: any): void;
    getDistanceToTargetNode(): any;
    getGroundAngleToTargetNode(): any;
    findPathToTargetNode(): any[];
    getPathLength(): number;
    dispose(): void;
}
