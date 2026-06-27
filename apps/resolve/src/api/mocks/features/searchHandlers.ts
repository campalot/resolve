import { http, graphql, HttpResponse } from 'msw';
import { getMockDb } from '../../../mocks/mockDB';
import { searchService } from '../../services/searchService';
import type { SearchVars } from '../../services/searchService';
import { withMockBehavior } from '../common/withMockBehavior';

export const searchHandlers = [
  // REST VERSION
  http.get('/api/w/:workspaceId/search', async ({ params, request }) => {
    return withMockBehavior(async () => {
      const url = new URL(request.url);
      // Extract variables from REST URL
      const vars = {
        workspaceId: params.workspaceId,
        queryString: url.searchParams.get('q') || '',
        offset: parseInt(url.searchParams.get('offset') || '0'),
        limit: parseInt(url.searchParams.get('limit') || '10'),
      };
      
      const data = await searchService.processSearchResults(
        getMockDb().interactions, 
        getMockDb().identities, 
        vars as SearchVars,
      );

      return HttpResponse.json({ search: data });
    });
  }),

  // GRAPHQL VERSION
  graphql.query('GetSearchResults', async ({ variables }) => {
    return withMockBehavior(async () => {
      const data = await searchService.processSearchResults(
        getMockDb().interactions, 
        getMockDb().identities, 
        variables as SearchVars,
      );

      return HttpResponse.json({ data: { search: data } });
    });
  }),
];
