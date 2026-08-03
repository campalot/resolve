import type { StorageAdapter } from "./StorageAdapter";
import fs from 'node:fs/promises';
import path from 'node:path';

// Store the JSON file in your backend directory or a shared workspace folder
const FILE_PATH = path.resolve('data.json');

export const NodeStorage: StorageAdapter = {
    async save(data) {
        await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
        console.log("💾 [DB] Successfully saved to data.json");
    },

    async load() {
        try {
            return await fs.readFile(FILE_PATH, "utf8");
        } catch {
            return null;
        }
    },

    async clear() {
        try {
            // Keeps the file valid for JSON.parse() on the next read
            await fs.writeFile(FILE_PATH, '{}'); 
            console.log('Storage cleared successfully.');
        } catch (err) {
            console.error('Failed to clear storage:', err);
        }
    }
};
