export type IdentityRecord = {
  __typename?: "Identity";
  id: string;
  workspaceId: string;
  name: string;
  type: IdentityType;
  status: IdentityStatus;
  avatarKey?: string;

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

export enum IdentitySort {
  Name = "name",
  Interactions = "interactions",
  Active = "active",
  Recent = "recent",
}

export type IdentityType = "Company" | "Individual";

export type IdentityStatus = "Active" | "Inactive";

export type IdentityStats = {
  total: number;
  active: number;
  awaiting: number;
  lastActivityAt: number | null;
}

export type Identity = {
  __typename?: "Identity";
  id: string;
  workspaceId: string;
  name: string;
  type: IdentityType;
  status: IdentityStatus;
  avatarUrl?: string;
  stats?: IdentityStats;

  // Optional metadata (keep minimal)
  industry?: string;
  country?: string;
  company?: Identity;
  personKey?: string;
  createdAt: string;
};

export type IdentityReference = {
  id: string;
  name: string;
};

export type CurrentUser = {
  id: string;
  name: string;
  accessibleWorkspaceIds: string[];
  role: "Legal" | "Finance" | "Admin";
};