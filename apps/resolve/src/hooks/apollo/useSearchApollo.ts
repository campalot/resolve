import { useQuery } from "@apollo/client";
import { GET_SEARCH_RESULTS } from "../../graphql/queries/getSearchResults";
import type { SearchResult } from "../../types/schema";
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";

export function useSearchApollo(queryString: string, limit: number = 10, { skip = false}: {skip: boolean}) {
  const { id: workspaceId } = useWorkspace();

  const { data, loading, error, fetchMore } = useQuery(GET_SEARCH_RESULTS, {
    variables: { workspaceId, queryString, offset: 0, limit },
    skip: !queryString || skip,
    notifyOnNetworkStatusChange: true,
  });

  const results: SearchResult[] = data?.search?.results ?? [];
  const hasMore: boolean = data?.search?.pageInfo?.hasMore ?? false;

  const fetchNextPage = () => {
    // Only fetch if we aren't already loading and there's more data
    if (!loading && hasMore) {
      fetchMore({
        variables: {
          // Use the actual current length of the results array for the next offset
          offset: results.length,
        },
      });
    }
  };

  return { results, loading, error, hasMore, fetchNextPage };
}


