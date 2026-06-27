import { http, graphql, HttpResponse } from 'msw';
import { getMockDb } from '../../../mocks/mockDB';
import { withMockBehavior } from '../common/withMockBehavior';

export const workspacesHandlers = [
  // REST VERSION
  http.get('/api/workspaces', async () => {
    return withMockBehavior(async () => {
      return HttpResponse.json({ 
        workspaces: getMockDb().workspaces 
      });
    });
  }),

  // GRAPHQL VERSION
  graphql.query('GetWorkspaces', async () => {
    return withMockBehavior(async () => {
      return HttpResponse.json({
        data: { 
          workspaces: getMockDb().workspaces 
        }
      });
    });
  }),
];
