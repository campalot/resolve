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

export type IdentityType = "Company" | "Individual";

export type IdentityStatus = "Active" | "Inactive";

export type Identity = {
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
  company?: Identity;
  personKey?: string;
  createdAt: string;
};