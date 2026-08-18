import { api } from '@/api/axiosInstance';
import type { CreateFormProps } from '@resolve/types';

export const createInteraction = async (data: CreateFormProps) => {
  const path = data.type.toLowerCase().replace(/_/g, "-");
  const workspaceId = data.workspaceId;
  const response =  await api.post(
    `/w/${workspaceId}/interactions/new/${path}`,
    data
  );
  return response.data; 
};