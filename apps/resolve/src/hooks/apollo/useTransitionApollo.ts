import { useMutation } from "@apollo/client";
import { ACTION_TO_STATUS } from "../../types/schema";
import { useToast } from "../../contexts/Toast/ToastContext";
import { TRANSITION_INTERACTION } from "../../graphql/mutations/transitionInteraction";
import type { ClientActivity } from "../../pages/InteractionDetail/InteractionActivity";
import type { Interaction, InteractionActivity, ToastNotification } from "../../types/schema";
import { useCurrentUser } from "../useCurrentUser";
import type { CurrentUser } from "../../contexts/CurrentUser/CurrentUserContext";
import type { TransitionVariables } from "../../api/mocks/features/transitionhandlers";


export function useTransitionApollo(interaction: Interaction) {
  const { addToast } = useToast();
  const currentUser: CurrentUser = useCurrentUser();

  const [mutate, { loading }] = useMutation(TRANSITION_INTERACTION, {
    update(cache, { data }) {
      const payload = data?.transitionInteraction;
      if (!payload) return;

      // 1. UPDATE USER STATS (Surgical Scalpel)
      cache.modify({
        id: cache.identify({ __typename: 'Identity', id: currentUser.id }),
        fields: {
          stats(existing) {
            return { ...existing, lastActivityAt: new Date().toISOString() };
          },
        },
      });

      // 2. UPDATE ACTIVITY FEED (The Timeline)
      cache.modify({
        fields: {
          interactionActivities(existingData = { results: [] }, { readField }) {
            const incomingActivities = payload.activities;
            const isOptimistic = incomingActivities?.some(
              (a: ClientActivity) => a.id === "temp-skeleton-id",
            ) ?? false;

            // 1. Only "clean" the existing list if we are NOT currently
            // trying to put the skeleton in.
            const cleanExisting = isOptimistic
              ? existingData.results
              : existingData.results.filter(
                  (ref: InteractionActivity) =>
                    readField("id", ref) !== "temp-skeleton-id",
                );

            // 2. Filter out duplicates (standard logic)
            const newActivities = incomingActivities?.filter(
              (incoming: InteractionActivity) =>
                !cleanExisting.some(
                  (existing: InteractionActivity) =>
                    readField("id", existing) === incoming.id,
                ),
            );

            return {
              ...existingData,
              results: [...newActivities, ...cleanExisting], // Skeleton goes to the top!
              pageInfo: {
                ...existingData.pageInfo,
                total:
                  (existingData.pageInfo?.total || 0) +
                  newActivities.filter((a: ClientActivity) => !a.isOptimistic)
                    .length,
              },
            };
          },
        },
      });

      // 3. EVICT IDENTITIES (The Hatchet - triggers re-sort)
      cache.evict({ id: "ROOT_QUERY", fieldName: "identities" });
      cache.gc();
    },

    onCompleted: (data) => {
      data?.transitionInteraction?.notifications?.forEach((n: ToastNotification, i: number) => {
        setTimeout(() => addToast(n.message, n.type), i * 150);
      });
    },
  });

  // Return a stable interface
  return {
    mutate: (variables: TransitionVariables) => mutate({ 
      variables,
      optimisticResponse: {
        transitionInteraction: {
          ...interaction,
          __typename: "Interaction",
          id: interaction.id,
          status: ACTION_TO_STATUS[variables.action],
          updatedAt: new Date().toISOString(),
          activities: [
            {
              id: "temp-skeleton-id",
              __typename: "InteractionActivity",
              workspaceId: variables.workspaceId,
              type: "SKELETON",
              interactionId: interaction.id,
              interactionTitle: interaction.title,
              occurredAt: new Date().toISOString(),

              actor: {
                __typename: "Identity",
                id: currentUser.id,
                workspaceId: variables.workspaceId,
                name: currentUser.name || "Current User",
                type: "Individual",
                status: "Active",
                createdAt: new Date().toISOString(),
                country: "US",
                avatarUrl: null, // Explicitly null for the fragment
                company: null,   // Explicitly null for the fragment
              },
              isOptimistic: true,
              metadata: {
                // Use a type the fragment actually defines
                __typename: "InteractionActivityMetadata_Status", 
                previousStatus: interaction.status,
                newStatus: ACTION_TO_STATUS[variables.action],
              },
            },
          ],
          notifications: [],
        },
      },
      // Pass the optimistic skeleton here if desired, 
      // or handle it inside the executeTransition service
    }),
    isLoading: loading,
  };
}
