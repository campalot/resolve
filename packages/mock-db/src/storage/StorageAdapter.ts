export type StorageAdapter = {
    save(data: unknown): Promise<void>;
    load(): Promise<string | null>;
    clear(): Promise<void>;
}
