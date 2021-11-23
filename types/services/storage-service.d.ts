export const StorageService: StorageServiceClass;
declare class StorageServiceClass {
    reads: number;
    writes: number;
    useNative: boolean;
    init(): void;
    set(key: any, value: any): any;
    get(key: any): any;
}
export {};
