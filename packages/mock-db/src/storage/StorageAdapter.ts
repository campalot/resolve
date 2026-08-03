export type StorageAdapter = {
    save(data: unknown): Promise<void>;
    load(): Promise<unknown>;
    clear(): Promise<void>;
}
