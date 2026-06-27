import type { InteractionActivity } from "../../types/schema";
import type { InteractionActivityRecord, InteractionFilters } from "../../types/api";
import { resolveInteractionActivity } from "../mocks/common/resolvers";

export type ActivitiesVars = {
  workspaceId: string;
  filters: InteractionFilters;
  offset?: number;
  limit?: number;
}

export const activitiesService = {
  // This replaces the logic inside your old dynamicMockLink AND your new MSW handler
  processActivities: (allActivities: InteractionActivityRecord[], variables: ActivitiesVars) => {
    const { workspaceId, filters = {}, offset = 0, limit = 50 } = variables ?? {};

    try {
      console.log("Service: Starting processing for", workspaceId);
      
      // Check if allActivities is even an array
      if (!Array.isArray(allActivities)) {
        throw new Error("allActivities is not an array!");
      }

      let resolved = allActivities
      .map(activity => {
        try {
          return resolveInteractionActivity(activity);
        } catch (e) {
          console.error("Crash during resolution of activity:", activity.id, e);
          return null;
        }
      })
      .filter(ia => ia?.workspaceId === workspaceId);

      console.log("Service: Successfully resolved", resolved.length);

      if (filters.interactionId) {
          resolved = resolved.filter((a: InteractionActivity | null) => a?.interactionId === filters.interactionId);
      }

      const batch = resolved.slice(offset, offset + limit);

      // Standard Response Shape
      return {
          results: batch,
          pageInfo: {
              total: resolved.length,
              hasMore: offset + limit < resolved.length,
              comments: resolved.filter((a: InteractionActivity | null) => a?.type === "COMMENT_ADDED").length
          }
      };
    } catch (globalError) {
      console.error("CRITICAL SERVICE ERROR:", globalError);
      throw globalError;
    }
  }
};
