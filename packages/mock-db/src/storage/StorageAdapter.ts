import { WorkspaceDataProps } from "@resolve/types";

export interface StorageAdapter {
  loadWorkspace(sessionId: string, workspaceId: string): Promise<WorkspaceDataProps | null>;
  saveWorkspace(sessionId: string, workspaceId: string, data: WorkspaceDataProps): Promise<void>;
  clearWorkspace?(sessionId: string, workspaceId: string): Promise<void>;
}
