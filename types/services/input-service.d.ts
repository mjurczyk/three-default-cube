export const InputService: InputServiceClass;
declare class InputServiceClass {
    keys: {};
    onKeyDown({ key: pressed }: {
        key: any;
    }): void;
    onKeyUp({ key: released }: {
        key: any;
    }): void;
    init(): void;
    key(key: any): any;
    dispose(): void;
}
export {};
