import { http, graphql, HttpResponse } from 'msw';
import { identityService } from '../../services/identitiesService';
import { getMockDb } from '../../../mocks/mockDB';
import type { IdentitiesListVars } from '../../services/identitiesService';
import { withMockBehavior } from '../common/withMockBehavior';

export const identityHandlers = [
  // REST VERSION
  http.get('/api/w/:workspaceId/identities', async ({ params, request }) => {
    return withMockBehavior(async () => {
      const url = new URL(request.url);
      // Extract variables from REST URL
      const vars = {
        workspaceId: params.workspaceId,
        sortBy: url.searchParams.get('sortBy'),
        offset: parseInt(url.searchParams.get('offset') || '0'),
        limit: parseInt(url.searchParams.get('limit') || '12'),
        filters: {
          status: url.searchParams.getAll("status"), // Returns [] if empty
          type: url.searchParams.getAll("type"),
          identityId: url.searchParams.get("identityId"),
          companyId: url.searchParams.get("companyId"),
          searchQuery: url.searchParams.get("searchText"),
        },
      };
      
      const data = await identityService.processIdentities(getMockDb().identities, vars as IdentitiesListVars);
      return HttpResponse.json({ identities: data });
    });
  }),

  // GRAPHQL VERSION
  graphql.query('GetIdentities', async ({ variables }) => {
    return withMockBehavior(async () => {
      const data = await identityService.processIdentities(getMockDb().identities, variables as IdentitiesListVars);
      return HttpResponse.json({ data: { identities: data } });
    });
  }),
];
