import type { 
  IdentityType, 
  IdentityStatus, 
  InteractionRole, 
  InteractionState, 
  InteractionType, 
  InteractionActivityMetadata_Comment, 
  InteractionActivityMetadata_Created,
  InteractionActivityMetadata_Status, 
  InteractionActivityType, 
  InteractionDataRecord 
} from "./schema";

export type IdentityRecord = {
  __typename?: "Identity";
  id: string;
  workspaceId: string;
  name: string;
  type: IdentityType;
  status: IdentityStatus;
  avatarUrl?: string;

  // Optional metadata (keep minimal)
  industry?: string;
  country?: string;
  companyId?: string;
  personKey?: string;
  createdAt: string;
};

export type IdentityFilters = {
  status?: string[];
  type?: string[];
  identityId?: string;
  searchText?: string;
  companyId?: string;
};
export type IdentitySort = "name" | "interactions" | "active" | "recent";


export type InteractionPartyRecord = {
  identityId: string;
  role: InteractionRole;
};

export type InteractionRecord = {
  id: string;
  workspaceId: string;
  title: string;
  status: InteractionState;
  type: InteractionType;
  data: InteractionDataRecord;
  parties: InteractionPartyRecord[];
  currentReviewerId?: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
};

export type InteractionsSort = "recent" | "oldest" | "created";
export type InteractionFilters = {
  status?: string[];
  identityId?: string;
  interactionId?: string;
  searchQuery?: string;
  parties?: string[];
  startDate?: string;
  endDate?: string;
  type?: string[];
};


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

