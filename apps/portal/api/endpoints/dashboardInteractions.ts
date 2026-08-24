import { api } from '@/api/axiosInstance';
import type { InteractionFilters } from "@resolve/types";

export const getDashboardInteractions = async (workspaceId: string, offset: number, limit: number, filters: InteractionFilters, sortBy: string) => {
  try {
    const response = await api.get(`/w/${workspaceId}/interactions/dashboard`, {
       params: {
        sortBy,
        offset,
        limit,
        ...filters, // This turns { status: ['A'], type: ['B'] } into ?status=A&type=B
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

