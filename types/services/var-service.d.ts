export const VarService: VarServiceClass;
declare class VarServiceClass {
    variables: {};
    listeners: {};
    persistentVars: {};
    init({ language }?: {
        language: any;
    }): void;
    setVar(id: any, value: any): void;
    getVar(id: any, onUpdate: any, onCreate: any): any;
    removeVar(id: any): void;
    registerPersistentVar(id: any, defaultValue: any): any;
    retrievePersistentVars(): any;
    resolveVar(variableString: any, onResolve: any, onCreate: any): any;
    disposeListener(id: any, callback: any): void;
    disposeListeners(): void;
}
export {};
