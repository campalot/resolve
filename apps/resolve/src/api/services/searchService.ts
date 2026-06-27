import type { Identity } from "../../types/schema";
import type { InteractionRecord } from "../../types/api";
import type { IdentityRecord } from "../../types/api";
import { resolveInteraction, interactionMatchesQuery } from "../mocks/common/resolvers";

export type SearchVars = {
    workspaceId: string;
    queryString?: string; 
    offset?: number;
    limit?: number;
}

export const searchService = {
  // This replaces the logic previously inside the old dynamicMockLink AND later the new MSW handlers
  processSearchResults: async (allInteractions: InteractionRecord[], allIdentities: IdentityRecord[], variables: SearchVars) => {
    const { workspaceId, queryString, offset = 0, limit = 10 } = variables;
    const normalizedQuery = queryString?.toLowerCase().trim() ?? "";

    const mockedDBTranslation = allInteractions.map((interaction) => resolveInteraction(interaction));
    
    const matchingIdentities =
        normalizedQuery.length === 0
            ? []
            : allIdentities
                .filter((identity: IdentityRecord) =>
                    identity.workspaceId === workspaceId &&
                    identity.name?.toLowerCase().includes(normalizedQuery)
                )
                .map((identity: Identity) => ({
                    __typename: "Identity",
                    ...identity,
                }));
          
    const matchingInteractions = normalizedQuery.length === 0
        ? []
        : mockedDBTranslation.filter((interaction) => interactionMatchesQuery(interaction, normalizedQuery) && interaction.workspaceId === workspaceId);
    
    const allResults = [
        ...matchingIdentities,
        ...matchingInteractions,
    ];
    
    // Slice for pagination
    const batch = allResults.slice(offset, offset + limit);

    return {
        __typename: "SearchResponse" as const,
        results: batch,
        pageInfo: {
            __typename: "PageInfo",
            hasMore: offset + limit < allResults.length,
            total: allResults.length,
        },
    }
  },
};
