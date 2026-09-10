import type { Identity } from "./identity";
import type { InteractionActivity, InteractionActivityType } from "./activity";
import type { MockDbProps } from "./database";
import type { Role } from "./workflow";


export type ToastType = "info" | "success" | "error" | "neutral";

export type InteractionPartyRecord = {
  identityId: string;
  role: InteractionRole;
};

export type InteractionParty = {
  role: InteractionRole;
  identity: Identity;
};

export type InteractionType = "PROPOSAL" |
  "CONTRACT" |
  "POLICY_UPDATE" |
  "VENDOR_ONBOARDING";

export type ProposalData = {
  summary: string;
  amount: number;
  currency: "USD";
  effectiveDate: string;
  expirationDate?: string;
};

export type ContractData = {
  summary: string;
  contractValue: number;
  termLengthMonths: number;
  autoRenew: boolean;
};

export type PolicyUpdateData = {
  summary: string;
  policyArea: "Security" | "Compliance" | "HR";
  effectiveDate: string;
  impactLevel: "Low" | "Medium" | "High";
};

export type VendorOnboardingData = {
  summary: string;
  vendorType: "Logistics" | "Software" | "Consulting";
  riskLevel: "Low" | "Medium" | "High";
  onboardingChecklistComplete: boolean;
};

export type InteractionDataRecord = ProposalData |
  ContractData |
  PolicyUpdateData |
  VendorOnboardingData | null;

export type CreateFormProps = {
  data: InteractionDataRecord;
  parties: InteractionPartyRecord[];
  actorId: string;
  workspaceId: string;
  type: InteractionType;
}

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

// Create a plain JavaScript object marked 'as const'
export const InteractionsSort = {
  Recent: "recent",
  Oldest: "oldest",
  Created: "created",
} as const;

// Extract the type union from the object's values
export type InteractionsSort = typeof InteractionsSort[keyof typeof InteractionsSort];

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




export type Interaction = {
  __typename?: "Interaction";
  id: string;
  workspaceId: string;
  title: string;
  status: InteractionState;
  type: InteractionType;
  data: InteractionDataRecord;
  parties: InteractionParty[];
  currentReviewer: Identity | null;
  creator: Identity;
  createdAt: string;
  updatedAt: string;
  description?: string;
  notifications?: ToastNotification[]; 
  permittedActions?: InteractionAction[];
  activities?: InteractionActivity[];
};

export type ToastNotification = {
  __typename?: "ToastNotification";
  message: string;
  type: ToastType;
}

export const interactionRoleValues = ["Buyer", "Seller", "Partner"];
export type InteractionRole = (typeof interactionRoleValues)[number];

export const interactionStateValues = ["DRAFT", "IN_REVIEW", "APPROVED", "REJECTED"];
export type InteractionState = typeof interactionStateValues[number];

export const interactionActionValues = ["SUBMIT", "APPROVE", "REJECT", "RESUBMIT"] as const;
export type InteractionAction = typeof interactionActionValues[number];

export const interactionRelationshipValues = ["Buyer", "Seller", "Partner", "Creator", "Reviewer"];
export type InteractionRelationship = (typeof interactionRelationshipValues)[number];

export type TransitionVariables = {
  id: string;
  action: InteractionAction; // Or your specific Action enum
  actorId: string;
  workspaceId: string;
  comment?: string;
  db?: MockDbProps;
  role?: Role;
}

export type DashboardInteraction = {
  id: string;
  title: string;
  status: InteractionState;
  relationship: InteractionRelationship | null;
  latestActivity: string | StatusChangeObj;
  createdAt: string;
  updatedAt: string;
  parties: InteractionParty[];
}

export type StatusChangeObj = {
  type: InteractionActivityType,
  actorName: string;
  newStatus: InteractionState;
}