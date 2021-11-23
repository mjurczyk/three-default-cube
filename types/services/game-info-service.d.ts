export const GameInfoService: GameInfoServiceClass;
declare class GameInfoServiceClass {
    config: {
        system: {};
        vars: {};
        labels: {};
        textures: {};
        models: {};
        audio: {};
        shaders: {};
        fonts: {};
        animations: {};
    };
    addConfig(config?: {}): GameInfoServiceClass;
    system(fps?: number, pixelRatio?: number, antialiasing?: boolean, postprocessing?: boolean, sceneBackgroundDefault?: number): GameInfoServiceClass;
    camera(fov?: number, near?: number, far?: number): GameInfoServiceClass;
    initialVars(vars?: {}): GameInfoServiceClass;
    vars(vars?: {}): GameInfoServiceClass;
    labels(language?: string, vars?: {}): GameInfoServiceClass;
    animation(id: any, animation: any): GameInfoServiceClass;
    font(id: any, font: any): GameInfoServiceClass;
    texture(id: any, texture: any): GameInfoServiceClass;
    model(id: any, model: any): GameInfoServiceClass;
    audio(id: any, audio: any): GameInfoServiceClass;
    shader(id: any, shader: any): GameInfoServiceClass;
    custom(key: any, value: any): GameInfoServiceClass;
}
export {};
