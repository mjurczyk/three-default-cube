export const AiService: AiServiceClass;
declare class AiServiceClass {
    aiNodes: any[];
    registerAiNode(object: any): void;
    getAiNodeById(id: any): any;
    disposeAiNode(object: any): void;
    disposeAll(): void;
}
export {};
