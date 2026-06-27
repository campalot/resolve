import { http, graphql, HttpResponse } from 'msw';
import { identityService } from '../../services/identitiesService';
import { withMockBehavior } from '../common/withMockBehavior';

export const profileHandlers = [
  // --- REST VERSION ---
  http.get('/api/w/:workspaceId/identities/:identityId', async ({ params }) => {
    return withMockBehavior(async () => {
      const data = await identityService.processProfile(
        params.workspaceId as string, 
        params.identityId as string
      );

      if (!data) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(data);
    });
  }),

  // --- GRAPHQL VERSION ---
  graphql.query('GetProfile', async ({ variables }) => {
    return withMockBehavior(async () => {
      const { workspaceId, identityId } = variables;
      console.info("🎯 MSW Intercepted GetInteractionDetail", variables);
      
      const data = await identityService.processProfile(workspaceId, identityId);

      if (!data) {
        return HttpResponse.json({
          errors: [{ message: "Profile not found" }]
        }, { status: 200 }); // GraphQL typically returns 200 with errors array
      }

      return HttpResponse.json({ data });
    });
  }),
];
