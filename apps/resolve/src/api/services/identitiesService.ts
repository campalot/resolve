import { HttpResponse } from 'msw';
import type { IdentityFilters, IdentityRecord } from "@resolve/types";
import { resolveIdentity, resolveInteraction, resolveInteractionActivity } from "../mocks/common/resolvers";
import { getMockDb } from "../../mocks/mockDB";
import { getProfileInteractionsAndActivities } from '../mocks/common/resolvers';

export type IdentitiesListVars = {
  workspaceId: string;
  sortBy: string;
  filters: IdentityFilters;
  offset?: number;
  limit?: number;
}

export const identityService = {
  // This replaces the logic inside your old dynamicMockLink AND your new MSW handler
  processIdentities: (allIdentities: IdentityRecord[], variables: IdentitiesListVars) => {
    const { workspaceId, sortBy, filters = {}, offset = 0, limit = 12 } = variables;

    // 1. Base Workspace Filter
    let resolved = allIdentities.filter(i => i.workspaceId === workspaceId).map(i => resolveIdentity(i));

    // 2. Apply Filters (Ported from your Apollo logic)
    const statusFilter = filters.status;
    if (statusFilter && statusFilter.length > 0) {
      resolved = resolved.filter(i => statusFilter.includes(i.status.toLowerCase()));
    }

    const typeFilter = filters.type;
    if (typeFilter && typeFilter.length > 0) {
      const normalizedTypes = typeFilter.map((t: string) => t.toLowerCase());
      resolved = resolved.filter(i => normalizedTypes.includes(i.type.toLowerCase()));
    }

    if (filters.searchText) {
      const q = filters.searchText.toLowerCase();
      resolved = resolved.filter(i => i.name?.toLowerCase().includes(q));
    }

    // 3. Sorting
    resolved.sort((a, b) => {
      if (sortBy === "interactions") return b.stats.total - a.stats.total;
      if (sortBy === "recent") {
        const dateB = b.stats.lastActivityAt ? new Date(b.stats.lastActivityAt).getTime() : 0;
        const dateA = a.stats.lastActivityAt ? new Date(a.stats.lastActivityAt).getTime() : 0;
        return dateB - dateA;
      }
      return a.name.localeCompare(b.name); // Default: Name
    });

    // 4. Standard Response Shape
    return {
      results: resolved.slice(offset, offset + limit),
      pageInfo: {
        total: resolved.length,
        hasMore: offset + limit < resolved.length,
      }
    };
  },

  processProfile: async (workspaceId: string, identityId: string) => {
    const db = getMockDb();
    const { activities, interactions } = getProfileInteractionsAndActivities(workspaceId as string, identityId as string);
    const resolvedInteractions = interactions.map((interaction) => resolveInteraction(interaction));
    const resolvedActivities = activities.map((ia) => resolveInteractionActivity(ia));

    const identityRecord = db.identities.find(i => i.id === identityId && i.workspaceId === workspaceId);
    const identity = identityRecord ? resolveIdentity(identityRecord) : undefined;

    if (!identity) return new HttpResponse(null, { status: 404 });

    return {
      identity,
      interactions: resolvedInteractions,
      activities: resolvedActivities
    };

  },
};
