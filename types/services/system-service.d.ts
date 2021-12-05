export const SystemService: SystemServiceClass;
declare class SystemServiceClass {
    isCordova: boolean;
    appStateListeners: any[];
    promised: any[];
    init({ statusBar }?: {
        statusBar: any;
    }): void;
    hideStatusBar(): void;
    lockOrientation(orientation?: any): void;
    onReady(then: any): void;
    disposeAll(): void;
}
export {};
