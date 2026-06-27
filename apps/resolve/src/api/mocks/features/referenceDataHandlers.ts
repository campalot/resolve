import { http, graphql, HttpResponse } from 'msw';
import { getMockDb } from '../../../mocks/mockDB';
import { interactionsListService } from '../../services/interactionsListService';
import { withMockBehavior } from '../common/withMockBehavior';

export const referenceDataHandlers = [
  // --- REST VERSION ---
  http.get('/api/w/:workspaceId/reference/interactions', async ({ params }) => {
    return withMockBehavior(async () => {
      const { workspaceId } = params;

      const data = await interactionsListService.processReferenceData(
        getMockDb().interactions, 
        workspaceId as string
      );

      return HttpResponse.json(data);
    });
  }),

  // --- GRAPHQL VERSION ---
  graphql.query('InteractionsReferenceData', async ({ variables }) => {
    return withMockBehavior(async () => {
      const { workspaceId } = variables;
      const data = await interactionsListService.processReferenceData(getMockDb().interactions, workspaceId);

      if (!data) {
        return HttpResponse.json({
          errors: [{ message: "Reference data not found" }]
        }, { status: 200 }); // GraphQL typically returns 200 with errors array
      }

      return HttpResponse.json({ data });
    });
  }),
];
