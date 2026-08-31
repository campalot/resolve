import type { IdentityRecord } from "./identity";
import type { InteractionRecord } from "./interaction";
import type { InteractionActivityRecord } from "./activity";
import { Workspace } from "./workspace";


export type MockDbProps = {
  identities: IdentityRecord[];
  interactions: InteractionRecord[];
  interactionActivities: InteractionActivityRecord[];
  workspaces: Workspace[];
}

export type WorkspaceDataProps = {
  identities: IdentityRecord[];
  interactions: InteractionRecord[];
  interactionActivities: InteractionActivityRecord[];
}