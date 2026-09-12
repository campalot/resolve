import { api } from '../axiosInstance';

type TransitionParams = {
  id: string;
  workspaceId: string;
  action: string;
  actorId: string;
  comment?: string;
}

export type TransitionBody = {
  action: string;
  actorId: string;
  comment?: string;
}

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const transitionInteraction = async (data: TransitionParams) => {
  const response = await api.post(`${baseURL}/api/w/${data.workspaceId}/interactions/${data.id}/transition`, {
    action: data.action,
    actorId: data.actorId,
    comment: data.comment,
  });
  return response.data; // Returns { ...interaction, activities: [], notifications: [] }
};
