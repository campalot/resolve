import { generatePath } from "react-router-dom";
import { useWorkspace } from "../contexts/Workspace/WorkspaceContext";

export function useWorkspacePath() {
  const workspace = useWorkspace();

  return (subPath: string) => {
    if (!workspace) {
      return "/";
    }

    return generatePath(`/w/:workspaceId/${subPath}`, {
      workspaceId: workspace.id,
    });
  };
}