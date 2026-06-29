import { api } from '../axiosInstance';
import type { IdentityFilters } from "@resolve/types";

export const getIdentities = async (workspaceId: string, offset: number, limit: number, filters: IdentityFilters, sortBy: string) => {
  try {
    const response = await api.get(`/w/${workspaceId}/identities`, {
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

