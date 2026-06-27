import { createContext, useContext } from "react";
import type { Workspace } from "../../types/schema";

type WorkspaceContextValue = {
  workspace: Workspace;
};

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context.workspace;
}

