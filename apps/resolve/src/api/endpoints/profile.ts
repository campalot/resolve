import { api } from '../axiosInstance';

export const getProfile = async (workspaceId: string, identityId: string) => {
  const response = await api.get(`/w/${workspaceId}/identities/${identityId}`);
  return response.data; 
};

