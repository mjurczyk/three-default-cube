export namespace InteractionEnums {
    const eventClick: string;
    const eventDrag: string;
    const eventHold: string;
    const eventRelease: string;
    const eventLeave: string;
    const stateEnabled: string;
    const stateHovered: string;
    const stateClicked: string;
    const stateIntInactive: number;
    const stateIntActive: number;
    const stateIntPending: number;
}
export const InteractionsService: InteractionsServiceClass;
declare class InteractionsServiceClass {
    listeners: any[];
    camera: any;
    pointer: any;
    delta: any;
    touches: any[];
    useTouch: boolean;
    init({ camera }?: {
        camera: any;
    }): void;
    onTouchMove(event: any): void;
    onTouchStart(event: any): void;
    onTouchEnd(event: any): void;
    onPointerMove(event: any): void;
    onPointerDown(event: any): void;
    onPointerUp(event: any): void;
    addListeners(): void;
    startTouch({ pointer, touch }: {
        pointer: any;
        touch: any;
    }): void;
    dismissTouch({ pointer, touch }: {
        pointer: any;
        touch: any;
    }): void;
    moveTouch({ pointer, delta, touch }: {
        pointer: any;
        delta: any;
        touch: any;
    }): void;
    registerListener(target: any, eventType: any, callback: any): void;
    registerInvisibleListener(target: any, eventType: any, callback: any): void;
    getHits({ pointer }: {
        pointer: any;
    }): any;
    disposeListener(target: any): void;
    disposeListeners(): void;
    disposePointerListeners(): void;
    dispose(): void;
}
export {};
