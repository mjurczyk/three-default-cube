export class SceneServiceClass {
    gameObjectRefs: {};
    parseScene({ target, navpath, actions, gameObjects, onCreate, }: {
        target: any;
        navpath: any;
        actions: any;
        gameObjects: any;
        onCreate: any;
    }): void;
    setBackground(texture: any, spherical?: boolean): void;
    setEnvironment(hdri: any): void;
    getEnvironment(): any;
    disposeAll(): void;
}
export const SceneService: SceneServiceClass;
