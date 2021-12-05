export const StorageService: StorageServiceClass;
declare class StorageServiceClass {
    reads: number;
    writes: number;
    useNative: boolean;
    init(): void;
    getAllKeys(): any;
    set(key: any, value: any): any;
    get(key: any): any;
}
export {};
