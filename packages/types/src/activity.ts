import type { Identity } from "./identity";
import type { InteractionPartyRecord, InteractionParty, InteractionState } from "./interaction";

export type InteractionActivityMetadataRecord = InteractionActivityMetadata_Status |
  InteractionActivityMetadataRecord_Reviewer |
  InteractionActivityMetadata_Comment |
  InteractionActivityMetadata_Created |
  InteractionActivityMetadataRecord_Decision;

export type InteractionActivityMetadataRecord_Reviewer = {
  __typename?: "InteractionActivityMetadataRecord_Reviewer";
  nextReviewer: InteractionPartyRecord;
};
export type InteractionActivityMetadataRecord_Decision = {
  __typename?: "InteractionActivityMetadataRecord_Decision";
  finalStatus: InteractionState;
  decisionMakerId: string;
};

export type InteractionActivityRecord = {
  __typename?: "InteractionActivityRecord";
  id: string;
  workspaceId: string;
  interactionId: string;
  interactionTitle: string;
  type: InteractionActivityType;
  occurredAt: string;
  actorId: string;
  metadata: InteractionActivityMetadataRecord;
};

export type InteractionActivityType = "INTERACTION_CREATED" | "STATUS_CHANGED" | "REVIEWER_ASSIGNED" | "COMMENT_ADDED" | "INTERACTION_DECIDED";

export type InteractionActivityMetadata = InteractionActivityMetadata_Status |
  InteractionActivityMetadata_Reviewer |
  InteractionActivityMetadata_Comment |
  InteractionActivityMetadata_Created |
  InteractionActivityMetadata_Decision;

export type InteractionActivityMetadata_Status = {
  __typename?: "InteractionActivityMetadata_Status";
  previousStatus: InteractionState;
  newStatus: InteractionState;
};

export type InteractionActivityMetadata_Reviewer = {
  __typename?: "InteractionActivityMetadata_Reviewer";
  nextReviewer: InteractionParty;
};

export type InteractionActivityMetadata_Comment = {
  __typename?: "InteractionActivityMetadata_Comment";
  commentExcerpt: string;
};

export type InteractionActivityMetadata_Created = {
  __typename?: "InteractionActivityMetadata_Created";
};

export type InteractionActivityMetadata_Decision = {
  __typename?: "InteractionActivityMetadata_Decision";
  finalStatus: InteractionState;
  decisionMaker: Identity;
};

export type InteractionActivity = {
  __typename?: "InteractionActivity";
  id: string;
  workspaceId: string;
  interactionId: string;
  interactionTitle: string;
  type: InteractionActivityType;
  occurredAt: string;
  actor: Identity;
  metadata: InteractionActivityMetadata;
};