import type { Workspace } from "../types/schema";
import { capitalize } from "../helpers";

const workspaceIds = ["alpha", "beta", "gamma"];

export function generateWorkspaces(): Workspace[] {
  return workspaceIds.map((id) => {
    return ({
      id,
      name: `${capitalize(id)}`,
    })
  });
}


