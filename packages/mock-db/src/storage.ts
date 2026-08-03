import type { StorageAdapter } from "./storage/StorageAdapter";
import { BrowserStorage } from "./storage/BrowserStorage";
import { NodeStorage } from "./storage/NodeStorage";

let currentStorage: StorageAdapter | null = null;

export const configureStorage = (adapter: StorageAdapter) => {
    currentStorage = adapter;
};

export const getStorage = () => currentStorage;

// export const resetDemo = () => {
//     BrowserStorage.clear();
//     NodeStorage.clear();
// };