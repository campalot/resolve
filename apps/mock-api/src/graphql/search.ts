import { builder } from './builder';
import { searchService } from '@resolve/domain'; // Your core domain service package
import { IdentityType } from './identity';       // Reuse your working Identity schema ref
import { InteractionType } from './interaction'; // Reuse your working Interaction schema ref
import { getMockDb } from '@resolve/mock-db';

// 1. Create a Union type that bundles your existing schemas together
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

// 2. Map the standalone PageInfo type wrapper for search pagination
const SearchPageInfoType = builder.objectRef<{ total: number; hasMore: boolean }>('SearchPageInfo').implement({
  fields: (t) => ({
    total: t.exposeInt('total'),
    hasMore: t.exposeBoolean('hasMore'),
  }),
});

// 3. Map the master SearchResultsConnection reference container
const SearchResultsConnectionType = builder.objectRef('SearchResultsConnection').implement({
  fields: (t) => ({
    results: t.expose('results', { type: [SearchResultUnion] }), // Exposes the mixed union list!
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
    resolve: async (_root, args) => {
      // 1. Structure the args to strictly match your SearchVars contract
      const vars = {
        workspaceId: args.workspaceId,
        queryString: args.queryString,
        offset: args.offset,
        limit: args.limit,
      };

      // 2. Execute the exact same domain method your MSW & REST endpoints used!
      return searchService.processSearchResults(
        getMockDb().interactions,
        getMockDb().identities,
        vars
      );
    },
  }),
}));