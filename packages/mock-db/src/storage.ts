import type { StorageAdapter } from "./storage/StorageAdapter";

let currentStorage: StorageAdapter | null = null;

export const configureStorage = (adapter: StorageAdapter) => {
  currentStorage = adapter;
};

export const getStorage = (): StorageAdapter => {

  if (!currentStorage) {
    throw new Error("Storage adapter not configured.");
  }

  return currentStorage;
};