import type { InteractionFilters } from "../types/api";
import type { IdentityFilters } from "../types/api";

export const profileKeys = {
  all: ['profile'] as const,
  detail: (workspaceId: string, identityId: string, role: string) => 
    [...profileKeys.all, workspaceId, identityId, role] as const,
};

export const interactionKeys = {
  all: ['interactions'] as const,
  lists: () => [...interactionKeys.all, 'list'] as const,
  list: (workspaceId: string, filters: InteractionFilters, sortBy: string, page: number) => 
    [...interactionKeys.lists(), workspaceId, { filters, sortBy, page }] as const,
  details: () => [...interactionKeys.all, 'detail'] as const,
  detail: (workspaceId: string, interactionId: string, role: string) => [...interactionKeys.details(), workspaceId, interactionId, role] as const,
  byIdentity: (workspaceId: string, identityId: string) => [...interactionKeys.all, 'byIdentity', workspaceId, identityId] as const,
};

export const identityKeys = {
  all: ['identities'] as const,
  lists: () => [...identityKeys.all, 'list'] as const,
  list: (workspaceId: string, filters: IdentityFilters, sortBy: string, page: number) => 
    [...identityKeys.lists(), workspaceId, { filters, sortBy, page }] as const,
  detail: (workspaceId: string, id: string) => 
    [...identityKeys.all, workspaceId, 'detail', id] as const,
};

export const activityKeys = {
  all: ['activities'] as const,
  feed: (workspaceId: string, filters: InteractionFilters) => 
    [...activityKeys.all, workspaceId, { filters }] as const,
};

export const referenceKeys = {
  all: ['reference'] as const,
  interactions: (workspaceId: string) => [...referenceKeys.all, 'interactions', workspaceId] as const,
};

export const workspaceKeys = {
  all: ['workspaces'] as const,
};
