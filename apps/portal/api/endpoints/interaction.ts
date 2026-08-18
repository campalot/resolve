import { api } from '@/api/axiosInstance';

export const getInteraction = async (workspaceId: string, interactionId: string) => {
  const response = await api.get(`/w/${workspaceId}/interactions/${interactionId}`);
  return response.data; 
};