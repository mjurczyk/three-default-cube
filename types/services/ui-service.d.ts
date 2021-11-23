export const UiService: UiServiceClass;
declare class UiServiceClass {
    uiElements: any[];
    uiScene: any;
    tween: number;
    createUiScene(): any;
    registerUiElement(object: any): void;
    isUiElement(object: any): boolean;
    onFrame(): void;
    disposeAll(): void;
}
export {};
