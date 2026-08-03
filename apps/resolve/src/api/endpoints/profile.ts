import { api } from '../axiosInstance';

export const getProfile = async (workspaceId: string, identityId: string) => {
  try {
    const response = await api.get(`/w/${workspaceId}/identities/${identityId}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

