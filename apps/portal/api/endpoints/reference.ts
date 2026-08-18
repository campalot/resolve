import { api } from '@/api/axiosInstance';

export const getInteractionsReferenceData = async (workspaceId: string) => {
  const response = await api.get(`/w/${workspaceId}/reference/interactions`);
  return response.data; 
};