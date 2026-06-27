import { api } from '../axiosInstance';

export const getWorkspaces = async () => {
  const response = await api.get(`/workspaces`);
  return response.data; 
};