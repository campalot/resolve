import type { Workspace } from "@resolve/types";
import { WorkspaceContext } from "./WorkspaceContext";

type WorkspaceProviderProps = {
  workspace: Workspace;
  selectWorkspace: (workspaceId: string) => void;
  children: React.ReactNode;
};

export function WorkspaceProvider({
  workspace,
  selectWorkspace,
  children,
}: WorkspaceProviderProps) {

  return (
    <WorkspaceContext.Provider value={{ workspace, selectWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}