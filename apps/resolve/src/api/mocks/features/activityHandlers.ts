import { http, graphql, HttpResponse } from 'msw';
import { activitiesService } from '../../services/activitiesService';
import { getMockDb } from '../../../mocks/mockDB';
import type { ActivitiesVars } from '../../services/activitiesService';
import { withMockBehavior } from '../common/withMockBehavior';

const getBase = (path: string) => 
  typeof window === 'undefined' ? `http://localhost/api${path}` : `/api${path}`;

export const activityHandlers = [
  // --- REST VERSION ---
  http.get(getBase(`/w/:workspaceId/activities`), async ({ params, request }) => {
    return withMockBehavior(async () => {
      const url = new URL(request.url);

      const vars = {
        workspaceId: params.workspaceId as string,
        offset: parseInt(url.searchParams.get('offset') || '0'),
        limit: parseInt(url.searchParams.get('limit') || '20'),
        filters: {
          interactionId: url.searchParams.get("interactionId") || undefined,
        },
      };

      const data = await activitiesService.processActivities(getMockDb().interactionActivities, vars as ActivitiesVars);
      console.log(`MSW: Found ${data.results.length} activities for ${vars.workspaceId}`);

      return HttpResponse.json({ interactionActivities: data });
    });
  }),

  // --- GRAPHQL VERSION ---
  graphql.query('GetInteractionActivities', async ({ variables }) => {
    return withMockBehavior(async () => {
      console.log('MSW GQL: Intercepted GetInteractionActivities');
      const data = await activitiesService.processActivities(getMockDb().interactionActivities, variables as ActivitiesVars);
      console.log('GQL SENDING:', JSON.stringify(data.results[0])); // Check for __typename!
      if (!data) {
        return HttpResponse.json({
          errors: [{ message: "Activities not found" }]
        }, { status: 200 }); // GraphQL typically returns 200 with errors array
      }

      return HttpResponse.json({ data: { interactionActivities: data } });
    });
  }),
];
