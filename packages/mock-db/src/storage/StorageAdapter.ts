import type { WorkspaceDataProps, Workspace } from "@resolve/types";

export interface StorageAdapter {
  loadWorkspace(sessionId: string, workspaceId: string): Promise<WorkspaceDataProps | Workspace[] | null>;
  saveWorkspace(sessionId: string, workspaceId: string, data: WorkspaceDataProps | Workspace[]): Promise<void>;
  clearWorkspace?(sessionId: string, workspaceId: string): Promise<void>;
}
