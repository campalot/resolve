import { api } from '../axiosInstance';
import type { SearchEnvelope } from '../../hooks/tanstack/useSearchTanStack';


export const getSearchResults = async (
  workspaceId: string,
  queryString: string,
  offset: number,
  limit: number
): Promise<SearchEnvelope> => {
  const { data } = await api.get(`/w/${workspaceId}/search`, {
    params: { q: queryString, offset, limit },
  });
  return data;
};