import axios from 'axios';

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

const baseURL = 'http://localhost:3001/api';

export const transitionInteraction = async (data: TransitionParams) => {
  const response = await axios.post(`${baseURL}/w/${data.workspaceId}/interactions/${data.id}/transition`, {
    action: data.action,
    actorId: data.actorId,
    comment: data.comment,
  });
  return response.data; // Returns { ...interaction, activities: [], notifications: [] }
};
