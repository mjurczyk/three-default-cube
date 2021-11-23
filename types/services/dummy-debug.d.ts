export namespace DebugFlags {
    const DEBUG_ENABLE: string;
    const DEBUG_LIVE: string;
    const DEBUG_LOG_MEMORY: string;
    const DEBUG_LOG_POOLS: string;
    const DEBUG_LOG_ASSETS: string;
    const DEBUG_ORBIT_CONTROLS: string;
    const DEBUG_SCROLL_VISIBLE: string;
    const DEBUG_TIME_LISTENERS: string;
    const DEBUG_SKINNING_SKELETONS: string;
    const DEBUG_ADS: string;
    const DEBUG_DISABLE_ADS: string;
    const DEBUG_STORAGE: string;
    const DEBUG_AI_NODES: string;
    const DEBUG_AI_TARGETS: string;
    const DEBUG_PHYSICS: string;
    const DEBUG_PHYSICS_DYNAMIC: string;
}
export const DummyDebug: DummyDebugClass;
declare class DummyDebugClass {
    stats: any;
    logs: any;
    leaks: {
        textures: number;
        geometries: number;
    };
    flags: {};
    on(debugFlag: any): void;
    off(debugFlag: any): void;
    get(debugFlag: any): any;
    showStats(): void;
    hideStats(): void;
    showLogs(): void;
    createLogLine(...logs: any[]): HTMLDivElement;
}
export {};
