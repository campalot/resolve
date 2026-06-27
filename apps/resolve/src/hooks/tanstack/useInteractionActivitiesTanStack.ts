import { useInfiniteQuery } from '@tanstack/react-query';
import { getInteractionActivities } from '../../api/endpoints/interactionActivities';
import type { InteractionFilters } from "../../types/api";
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";
import { activityKeys } from '../queryKeys';

export function useInteractionActivitiesTanStack({ filters, enabled }: { filters: InteractionFilters, enabled: boolean }) {
  const { id: workspaceId } = useWorkspace();
  const limit = 20;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    // Query key includes filters so the list resets when filters change
    queryKey: activityKeys.feed(workspaceId, filters),
    
    // pageParam is managed by TanStack. We'll start at 0.
    initialPageParam: 0,
    
    queryFn: ({ pageParam }) => 
      getInteractionActivities(workspaceId, pageParam, limit, filters),
    
    // This replaces the Apollo "merge" logic
    // It calculates the next 'offset' based on the last page received
    getNextPageParam: (lastPage, allPages) => {
      // 1. Calculate the current total count of items we have across ALL pages
      const currentCount = allPages.flatMap(page => 
        page?.interactionActivities?.results ?? [] // Added optional chaining here
      ).length;

      // 2. Check if the LAST page we got says there is more data
      const hasMore = lastPage?.interactionActivities?.pageInfo?.hasMore;

      // 3. Return the new offset, or undefined to stop fetching
      return hasMore ? currentCount : undefined;
    },
    
    enabled: !!workspaceId && enabled,
  });
  
  // Flatten all pages into a single results array
  const results = data?.pages.flatMap(page => 
    page?.interactionActivities?.results ?? []
  ) ?? [];

  // Get totals from the MOST RECENT page fetched
  const lastPageInfo = data?.pages[data?.pages.length - 1]?.interactionActivities?.pageInfo;

  return {
    results,
    loading: isLoading,
    isFetchingNextPage,
    error,
    total: lastPageInfo?.total ?? 0,
    comments: lastPageInfo?.comments ?? 0,
    hasMore: hasNextPage,
    fetchNextPage,
  };
}
