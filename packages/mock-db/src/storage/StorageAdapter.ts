export interface StorageAdapter {
  loadWorkspace(sessionId: string, workspaceId: string): Promise<any | null>;
  saveWorkspace(sessionId: string, workspaceId: string, data: any): Promise<void>;
  clearWorkspace?(sessionId: string, workspaceId: string): Promise<void>;
}
