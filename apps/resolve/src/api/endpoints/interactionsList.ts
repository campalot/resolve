import { api } from '../axiosInstance';
import type { InteractionFilters } from "../../types/api";

export const getInteractionsList = async (workspaceId: string, offset: number, limit: number, filters: InteractionFilters, sortBy: string) => {
  try {
    const response = await api.get(`/w/${workspaceId}/interactions`, {
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

