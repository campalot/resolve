import { api } from '@/api/axiosInstance';

export const getWorkspaces = async () => {
  const response = await api.get(`/workspaces`);
  return response.data; 
};