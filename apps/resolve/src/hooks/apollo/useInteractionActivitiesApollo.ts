
import { useRef, useState } from "react";
import { useQuery } from "@apollo/client";
import type { InteractionFilters } from "@resolve/types";
import { GET_INTERACTION_ACTIVITIES } from "../../graphql/queries/getInteractionActivities";
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";

export function useInteractionActivitiesApollo({ filters, skip }: { filters: InteractionFilters, skip: boolean }) {
  const workspace = useWorkspace();
  const limit = 20;
  const [offset, setOffset] = useState(0);
  
  const { data, loading, error, fetchMore } = useQuery(GET_INTERACTION_ACTIVITIES, {
    variables: { offset, limit, filters, workspaceId: workspace.id },
    notifyOnNetworkStatusChange: true,
    skip,
  });

  // Derived values - these update INSTANTLY when the cache refetches
  const results = data?.interactionActivities?.results ?? [];
  const total = data?.interactionActivities?.pageInfo?.total ?? 0;
  const hasMore = data?.interactionActivities?.pageInfo?.hasMore ?? false;
  const comments = data?.interactionActivities?.pageInfo?.comments ?? 0;

  const isFetching = useRef(false);

  const fetchNextPage = async () => {
    if (isFetching.current || !hasMore) return;
    
    isFetching.current = true;
    const nextOffset = results.length; // Use actual count to prevent gaps
    try {
      await fetchMore({ variables: { offset: nextOffset } });
      setOffset(nextOffset);
    } finally {
      isFetching.current = false;
    }
  };

  return {
    results,
    loading,
    error,
    total,
    comments,
    hasMore,
    fetchNextPage,
    isFetchingNextPage: isFetching.current === true,
  };
}