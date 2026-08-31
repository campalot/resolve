import { builder } from './builder';
import { searchService } from '@resolve/domain';
import { IdentityType } from './identity';
import { InteractionType } from './interaction';
import { getMockDb, runAgnosticDatabaseHydration } from '@resolve/mock-db';
import { PageInfo, SearchConnection } from '@resolve/types';

// Create a Union type that bundles existing schemas together
const SearchResultUnion = builder.unionType('SearchResult', {
  types: [IdentityType, InteractionType],
  resolveType: (recordValue: any) => {
    // Check fields or the implicit __typename to tell GraphQL how to parse the block
     if (recordValue.__typename === 'Identity' && !('title' in recordValue)) {
      return 'Identity';
    }
    return 'Interaction';
  },
});

// Map the standalone PageInfo type wrapper for search pagination
const SearchPageInfoType = builder.objectRef<PageInfo>('SearchPageInfo').implement({
  fields: (t) => ({
    total: t.exposeInt('total'),
    hasMore: t.exposeBoolean('hasMore'),
  }),
});

// Map the master SearchResultsConnection reference container
const SearchResultsConnectionType = builder.objectRef<SearchConnection>('SearchResultsConnection').implement({
  fields: (t) => ({
    results: t.expose('results', { type: [SearchResultUnion] }), // Exposes the mixed union list
    pageInfo: t.expose('pageInfo', { type: SearchPageInfoType }),
  }),
});

builder.queryFields((t) => ({
  search: t.field({
    type: SearchResultsConnectionType,
    args: {
      workspaceId: t.arg.id({ required: true }),
      queryString: t.arg.string({ required: true }),
      offset: t.arg.int({ required: true }),
      limit: t.arg.int({ required: true }),
    },
    resolve: async (_root, args, context) => {
      const { sessionId } = context.sessionContext;
      const workspaceId = args.workspaceId || context.sessionContext.currentWorkspaceId;
      await runAgnosticDatabaseHydration(sessionId, workspaceId);
      const db = getMockDb();
      // Structure the args to strictly match the SearchVars contract
      const vars = {
        workspaceId: args.workspaceId,
        queryString: args.queryString,
        offset: args.offset,
        limit: args.limit,
      };

      return searchService.processSearchResults(
        db.interactions,
        db.identities,
        vars
      );
    },
  }),
}));