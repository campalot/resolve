import { createContext, useContext } from "react";
import type { Workspace } from "@resolve/types";

type WorkspaceContextValue = {
  workspace: Workspace;
  selectWorkspace: (workspaceId: string) => void;
};

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(
  null,
);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context.workspace;
}

export const useWorkspaceActions = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context.selectWorkspace;
}