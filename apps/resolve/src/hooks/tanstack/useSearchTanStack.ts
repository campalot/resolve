import { useInfiniteQuery } from '@tanstack/react-query';
import { getSearchResults } from '../../api/endpoints/search';
import { useWorkspace } from '../../contexts/Workspace/WorkspaceContext';
import type { SearchResponse } from '../../types/schema';
import type { InfiniteData } from '@tanstack/react-query';

export type SearchEnvelope = {
  search: SearchResponse;
};

type SearchQueryConfig = {
  data: SearchEnvelope;
  error: Error;
  key: (string | undefined)[];
  pageParam: number;
};

export function useSearchTanStack(queryString: string, limit: number = 10, { enabled = true}: {enabled: boolean}) {
  const { id: workspaceId } = useWorkspace();

  const query = useInfiniteQuery<
    SearchQueryConfig['data'],
    SearchQueryConfig['error'],
    InfiniteData<SearchQueryConfig['data']>,
    SearchQueryConfig['key'],
    SearchQueryConfig['pageParam']
  >({
    queryKey: ['search', workspaceId, queryString],
    queryFn: ({ pageParam = 0 }) => 
      getSearchResults(workspaceId, queryString, pageParam, limit),
    
    // Offset logic: use the current length of all fetched results as the next offset
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.flatMap(p => p.search.results).length;
      return lastPage.search.pageInfo.hasMore ? currentCount : undefined;
    },
    
    enabled: !!queryString && !!workspaceId && enabled,
    initialPageParam: 0,
  });

  // Flatten pages for the UI
  const results = query.data?.pages.flatMap(p => p.search.results) ?? [];
  const hasMore = query.hasNextPage;

  return { 
    results, 
    loading: query.isLoading || query.isFetchingNextPage, 
    error: query.error, 
    hasMore, 
    fetchNextPage: query.fetchNextPage 
  };
}


