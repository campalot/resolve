import { api } from '../axiosInstance';
import type { InteractionFilters } from "@resolve/types";

export const getInteractionActivities = async (workspaceId: string, pageParam: number, limit: number, filters: InteractionFilters) => {
  const { data } = await api.get(`/w/${workspaceId}/activities`, {
    params: { offset: pageParam, limit, ...filters },
  });
  return data; // Should return { results, pageInfo: { total, hasMore, comments } }
};
