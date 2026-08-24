import type { Interaction, InteractionFilters, InteractionRecord } from "@resolve/types";
import { interactionMatchesQuery, resolveInteraction, resolveDashboardInteraction } from "./common/resolvers";
import { parseDate } from "@resolve/utils";

export type InteractionsListVars = {
  workspaceId: string;
  sortBy: string;
  filters: InteractionFilters;
  offset?: number;
  limit?: number;
}

export const interactionsListService = {
  // This replaces the logic inside your old dynamicMockLink AND your new MSW handler
  processInteractions: (allInteractions: InteractionRecord[], variables: InteractionsListVars) => {
    const { workspaceId, sortBy, filters = {}, offset = 0, limit = 50 } = variables ?? {};

    // 1. Base Workspace Filter
    //let resolved = allInteractions.map((interaction) => resolveInteraction(interaction)).filter((i: Interaction) => i.workspaceId === workspaceId);
    // let resolved = allInteractions.map((interaction, index) => {
    //   return resolveInteraction(interaction);
    // });

    let resolved = allInteractions.filter(i => i.workspaceId === workspaceId).map(i => resolveInteraction(i));
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

    if (filters.identityId) {
        resolved = resolved.filter((interaction) =>
            interaction.creator.id === filters.identityId || interaction.currentReviewer?.id === filters.identityId || interaction.parties.some(
            (p) => p?.identity.id === filters.identityId
            )
        );
    }
    const partiesFilter = filters.parties;
    if (partiesFilter && partiesFilter.length > 0) {
        resolved = resolved.filter((interaction) => {
            return interaction.parties.some(
            (p) => partiesFilter.includes(p?.identity.id) 
            )
        });
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      resolved = resolved.filter(i => interactionMatchesQuery(i, q));
    }

    const startDateFilter = filters.startDate;
    if (startDateFilter) {
      resolved = resolved.filter(i => parseDate(i.updatedAt) > startDateFilter);
    }
    const endDateFilter = filters.endDate;
    if (endDateFilter) {
      resolved = resolved.filter(i => parseDate(i.updatedAt) < endDateFilter);
    }

    // 3. Sorting
    if (sortBy) {
        if (sortBy === "recent") {
            resolved = resolved.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        } else if (sortBy === "oldest") {
            resolved = resolved.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        } else if (sortBy === "created") {
            resolved = resolved.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }

    const batch = resolved.slice(offset, offset + limit);

    // 4. Standard Response Shape
    return { 
      results: batch,
      pageInfo: {
        hasMore: offset + limit < resolved.length,
        total: resolved.length,
      },
    };
  },

  processDashboardInteractions: (allInteractions: InteractionRecord[], variables: InteractionsListVars) => {
    const { workspaceId, sortBy, filters = {}, offset = 0, limit = 50 } = variables ?? {};

    let resolved = allInteractions.filter(i => i.workspaceId === workspaceId);
    // 2. Apply Filters (Ported from your Apollo logic)
    if (filters.identityId) {
        resolved = resolved.filter((interaction) =>
            interaction.creatorId === filters.identityId || interaction.currentReviewerId === filters.identityId || interaction.parties.some(
            (p) => p?.identityId === filters.identityId
            )
        );
    }

    const statusFilter = filters.status;
    if (statusFilter && statusFilter.length > 0) {
        resolved = resolved.filter(i => statusFilter.includes(i.status.toLowerCase()));
    }

    const partiesFilter = filters.parties;
    if (partiesFilter && partiesFilter.length > 0) {
        resolved = resolved.filter((interaction) => {
            return interaction.parties.some(
            (p) => partiesFilter.includes(p?.identityId) 
            )
        });
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      resolved = resolved.filter(i => interactionMatchesQuery(i, q));
    }

    const startDateFilter = filters.startDate;
    if (startDateFilter) {
      resolved = resolved.filter(i => parseDate(i.updatedAt) > startDateFilter);
    }
    const endDateFilter = filters.endDate;
    if (endDateFilter) {
      resolved = resolved.filter(i => parseDate(i.updatedAt) < endDateFilter);
    }

    // 3. Sorting
    if (sortBy) {
        if (sortBy === "recent") {
            resolved = resolved.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        } else if (sortBy === "oldest") {
            resolved = resolved.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        } else if (sortBy === "created") {
            resolved = resolved.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    }

    const dashboardResolved = resolved.map(i => resolveDashboardInteraction(i, filters.identityId || ""));

    const batch = dashboardResolved.slice(offset, offset + limit);

    // 4. Standard Response Shape
    return { 
      results: batch,
      pageInfo: {
        hasMore: offset + limit < dashboardResolved.length,
        total: dashboardResolved.length,
      },
    };
  },

  processReferenceData: async (allInteractions: InteractionRecord[], workspaceId?: string) => {
    let workspaceInteractions: InteractionRecord[] = [];
    if (workspaceId) {
        workspaceInteractions = allInteractions.filter((interaction) => interaction.workspaceId === workspaceId);
    }
    const resolved = workspaceInteractions.map((interaction) => resolveInteraction(interaction));

    const parties = Array.from(
        new Map(
        resolved
            .flatMap(int => int.parties)
            .flatMap(party => party?.identity || [])
            .map(ident => [ident.id, { id: ident.id, name: ident.name }])
        ).values()
    );
    const interactionStatuses = Array.from(new Set(resolved.map((int) => int.status)));
    const interactionTypes = Array.from(new Set(resolved.map((int) => int.type)));

    return {
      parties,
      interactionStatuses,
      interactionTypes,
    };
  },
};
