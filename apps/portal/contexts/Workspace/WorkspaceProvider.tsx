import type { Workspace } from "@resolve/types";
import { WorkspaceContext } from "./WorkspaceContext";

type WorkspaceProviderProps = {
  workspace: Workspace;
  children: React.ReactNode;
};

export function WorkspaceProvider({
  workspace,
  children,
}: WorkspaceProviderProps) {

  return (
    <WorkspaceContext.Provider value={{ workspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}