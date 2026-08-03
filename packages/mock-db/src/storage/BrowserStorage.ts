import type { StorageAdapter } from "./StorageAdapter";

const STORAGE_KEY = 'RESOLVE_DEMO_DB';

export const BrowserStorage: StorageAdapter = {
    async save(data) {
        try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        // Small delay so the user actually sees the "Sync" happen
        // setTimeout(() => useAppStore.getState().setSyncing(false), 500); 
        console.log("💾 [DB] Successfully saved to LocalStorage");
        } catch (e) {
        //useAppStore.getState().setSyncing(false);
        console.error("❌ [DB] Persistence failed", e);
        }
    },

    async load() {
        const savedData = localStorage.getItem(STORAGE_KEY);
        return savedData;
    },

    async clear() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload(); // Hard reload to re-seed
            console.log('Local Storage cleared successfully.');
        } catch (err) {
            console.error('Failed to clear local storage:', err);
        }
    }
};