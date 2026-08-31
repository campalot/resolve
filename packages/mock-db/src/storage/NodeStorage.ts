import type { StorageAdapter } from "./StorageAdapter";
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Generates a tiny, isolated key per workspace per user session
export const getFilePath = (sessionId: string, workspaceId: string) => 
  `session_${sessionId}_workspace_${workspaceId}.json`;

// Store the JSON file in your backend directory or a shared workspace folder
const FILE_PATH = resolve('data.json');

export const NodeStorage: StorageAdapter = {
    async saveWorkspace(sessionId: string, workspaceId: string, data: any) {
        const filePath = getFilePath(sessionId, workspaceId);
        await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`💾 [DB] Successfully saved to session_${sessionId}_workspace_${workspaceId}.json`);
    },

    async loadWorkspace(sessionId: string, workspaceId: string) {
        const filePath = getFilePath(sessionId, workspaceId);
        try {
            const fileContent = await readFile(filePath, "utf8");
            return JSON.parse(fileContent);
        } catch {
            return null;
        }
    },

    async clearWorkspace(sessionId: string, workspaceId: string) {
        const filePath = getFilePath(sessionId, workspaceId);
        try {
            // Keeps the file valid for JSON.parse() on the next read
            await writeFile(filePath, '{}'); 
            console.log('Storage cleared successfully.');
        } catch (err) {
            console.error('Failed to clear storage:', err);
        }
    }
};
