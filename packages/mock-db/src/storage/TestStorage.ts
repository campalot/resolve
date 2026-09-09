import type { StorageAdapter } from "./StorageAdapter";
import { WorkspaceDataProps } from "@resolve/types";

// Use a map to correctly isolate data per session and per workspace shard
const memoryDb = new Map<string, any>();

const testWorkspaces = [
  { id: "alpha", name: "Alpha Workspace" },
  { id: "beta", name: "Beta Workspace" },
];

export const TestStorage: StorageAdapter = {
  // Save specific workspace's dataset
  async saveWorkspace(sessionId: string, workspaceId: string, data: WorkspaceDataProps): Promise<void> {
    const key = `${sessionId}:${workspaceId}`;
    // Deep clone ensures that mutations inside a test don't pollute the storage pool
    memoryDb.set(key, structuredClone(data));
  },

  // Load specific workspace's dataset
  async loadWorkspace(sessionId: string, workspaceId: string): Promise<WorkspaceDataProps | null> {
    const key = `${sessionId}:${workspaceId}`;
    const data = memoryDb.get(key);

    if (data) {
      return structuredClone(data);
    }

    // Fallback: If loading the core workspaces menu layout and it hasn't been saved yet
    if (workspaceId === "workspaces") {
      return testWorkspaces;
    }

    return null;
  },

  // Clear specific workspace shard
  async clearWorkspace(sessionId: string, workspaceId: string): Promise<void> {
    const key = `${sessionId}:${workspaceId}`;
    memoryDb.delete(key);
  },

  // Extension method used by Solution 1 network resets to nuke everything cleanly
  clearAllPools(): void {
    memoryDb.clear();
  }
} as StorageAdapter & { clearAllPools: () => void };
