import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { useToast } from '../../contexts/Toast/ToastContext';
import { transitionInteraction } from '../../api/endpoints/transitionInteraction';
import { activityKeys, interactionKeys } from '../queryKeys';
import type { Identity, Interaction, InteractionActivity, ToastNotification, PageInfo } from '@resolve/types';
import { useCurrentUser } from '../useCurrentUser';
import type { CurrentUser } from '../../contexts/CurrentUser/CurrentUserContext';

export type ActivityPage = {
  interactionActivities: {
    results: (InteractionActivity & { isOptimistic?: boolean })[];
    pageInfo: PageInfo;
  };
};

// The shape of the entire TanStack Cache for an infinite query
export type ActivityCache = InfiniteData<ActivityPage>;

export type InteractionListPage = {
  interactions: {
    results: Interaction[];
    pageInfo: PageInfo;
  };
};

// If it's a paginated list (InfiniteQuery), use InfiniteData
export type InteractionListCache = InfiniteData<InteractionListPage>;

// If it's a simple single-page query, just use the Page type
export type InteractionSingleCache = InteractionListPage;

export function useTransitionTanStack(interaction: Interaction) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const currentUser: CurrentUser = useCurrentUser();

  
  return useMutation<
    { transitionInteraction: Interaction & { activities: InteractionActivity[], notifications: ToastNotification[] } }, 
    Error, 
    { id: string; workspaceId: string; action: string; actorId: string; comment?: string }, // Variables
    { previousActivities: ActivityCache | undefined } // Context
  >({
    mutationFn: transitionInteraction, // Your Axios POST call

    onMutate: async (variables) => {
      const { workspaceId, id: interactionId } = variables;
      const activityKey = activityKeys.feed(workspaceId, { interactionId });

      const optimisticActor: Identity = {
        __typename: "Identity" as const,
        id: currentUser.id,
        workspaceId,
        name: currentUser.name || "Current User",
        type: "Individual",
        status: "Active",
        createdAt: new Date().toISOString(),
        country: "US",
      };

      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: activityKey });
      // Snapshot the previous value
      const previousActivities = queryClient.getQueryData<ActivityCache>(activityKey);

      queryClient.setQueryData<ActivityCache>(activityKey, (old) => {
        if (!old?.pages) return old;

        const skeleton = {
          isOptimistic: true,
          type: "STATUS_CHANGED" as const,
          occurredAt: new Date().toISOString(),
          actor: optimisticActor,
          id: "temp-skeleton-id",
          __typename: "InteractionActivity" as const,
          workspaceId,
          interactionId,
          interactionTitle: interaction.title,
          metadata: {
            __typename: "InteractionActivityMetadata_Created" as const,
          },

        };

        return {
          ...old,
          pages: old.pages.map((page, index): ActivityPage => {
            if (index !== 0) return page;
            return {
              ...page,
              interactionActivities: {
                ...page.interactionActivities,
                // 1. Add Skeleton to results
                results: [skeleton, ...(page.interactionActivities?.results || [])],
                // 2. Optimistically increment the total count for the Stats Box
                pageInfo: {
                  ...page.interactionActivities.pageInfo,
                  total: (page.interactionActivities.pageInfo?.total || 0) + 1
                }
              }
            };
          })
        };
      });

      return { previousActivities };
    },


    // 1. THE SCALPEL (Immediate UI Update)
    onSuccess: (data, variables) => {
      const { workspaceId, id: interactionId } = variables;

      // The fresh interaction object from your server response
      const updatedInteraction = data.transitionInteraction; 

      const activityKey = activityKeys.feed(workspaceId, { interactionId });
      // Update Activity Feed & Stats Box with REAL server counts
      queryClient.setQueryData<ActivityCache>(activityKey, (old) => {
        if (!old?.pages) return old;
        
        return {
          ...old,
          pages: old.pages.map((page, index) => {
            const filtered = (page.interactionActivities?.results || []).filter(a => !a.isOptimistic);
            
            if (index === 0) {
              return {
                ...page,
                interactionActivities: {
                  ...page.interactionActivities,
                  results: [...updatedInteraction.activities, ...filtered],
                  // Use the actual total from the server response
                  pageInfo: {
                    ...page.interactionActivities.pageInfo,
                    total: (page.interactionActivities.pageInfo?.total || 0) + (updatedInteraction.activities?.length || 0)
                  },
                }
              };
            }
            return { ...page, interactionActivities: { ...page.interactionActivities, results: filtered } };
          })
        };
      });

      // 1. Update the DETAIL views
      // Matches keys starting with ['interactions', 'detail']
      queryClient.setQueriesData<{ interaction: Interaction }>(
        { queryKey: interactionKeys.details() }, 
        (old) => {
          if (!old?.interaction) return old;

          if (old.interaction.id === interactionId) {
            // Return matching the Detail API shape: { interaction: { ... } }
            return { 
              ...old, 
              interaction: { ...old.interaction, ...updatedInteraction } 
            };
          }
          return old;
        }
      );

      // 2. Update the LIST views
      // Matches keys starting with ['interactions', 'list']
      queryClient.setQueriesData(
        { queryKey: interactionKeys.lists() }, 
        (old: InteractionListPage) => {
          // Adjusted for your API shape: { interactions: { results: [] } }
          if (!old?.interactions?.results) return old;

          return {
            ...old,
            interactions: {
              ...old.interactions,
              results: old.interactions.results.map((i: Interaction) => 
                i.id === interactionId ? { ...i, ...updatedInteraction } : i
              )
            }
          };
        }
      );

      // 2. THE HATCHET (Background Refresh for Sorting)
      // Replaces Apollo's cache.evict
      // Invalidate the Identities list to trigger a re-sort on the People page
      queryClient.invalidateQueries({ queryKey: ['identities', workspaceId] });
      
      // Invalidate Interaction Lists to ensure sort order (e.g. "Recently Updated") is correct
      queryClient.invalidateQueries({ queryKey: interactionKeys.lists() });

      // Update the Activity Feed: Replace Skeleton with real data
      queryClient.setQueryData(['activities', workspaceId], (old: InteractionActivity[]) => {
        if (!old) return old;
        
        // Remove the skeleton and add the new real activities from the server
        const filtered = old.filter((a: InteractionActivity) => a.id !== "temp-skeleton-id");
        return [...updatedInteraction.activities, ...filtered];
      });
    },

    onSettled: (data, _error, variables) => {
      // 3. THE FEED UPDATE
      // Replace the "Skeleton" in the Activity Feed with the actual activities
      queryClient.invalidateQueries({ 
        queryKey: ['activities', variables.workspaceId] 
      });

      // 4. TOAST NOTIFICATIONS
      data?.transitionInteraction?.notifications?.forEach((n: ToastNotification, i: number) => {
        setTimeout(() => addToast(n.message, n.type), i * 150);
      });
    },
    onError: (_err, variables, context) => {
      // Rollback to previous activities if the mutation fails
      queryClient.setQueryData(
        ['activities', variables.workspaceId], 
        context?.previousActivities
      );
    },
  });
}
