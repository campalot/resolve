import type { Workspace } from "@resolve/types";
import { capitalize } from "@resolve/utils";

const workspaceIds = ["alpha", "beta", "gamma"];

export function generateWorkspaces(): Workspace[] {
  return workspaceIds.map((id) => {
    return ({
      id,
      name: `${capitalize(id)}`,
    })
  });
}


