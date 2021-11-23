export const TimeService: TimeServiceClass;
declare class TimeServiceClass {
    frameListeners: any[];
    intervals: {};
    persistentFrameListeners: {};
    createTimeoutPromise(timeout?: number): any;
    registerFrameListener(onFrame: any): any;
    registerIntervalListener(onIntervalStep: any, intervalTime?: number): void;
    registerPersistentFrameListener(onFrame: any): any;
    onFrame({ dt, elapsedTime }: {
        dt: any;
        elapsedTime: any;
    }): void;
    disposeFrameListener(frameListener: any): void;
    disposePersistentListener(uid: any): void;
    disposeIntervalListener(intervalListener: any, intervalTime: any): void;
    disposeAll(): void;
}
export {};
