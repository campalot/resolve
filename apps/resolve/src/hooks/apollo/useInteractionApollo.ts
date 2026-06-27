import { useQuery } from "@apollo/client";
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";
import { GET_INTERACTION } from "../../graphql/queries/getInteraction";
import type { Interaction } from "../../types/schema";

type GetInteractionData = {
  interaction: Interaction;
};

type GetInteractionVars = {
  workspaceId: string;
  interactionId: string;
};

export function useInteractionApollo(interactionId: string, { skip }: {skip: boolean}) {
  const workspace = useWorkspace();
  const { data, loading, error } = useQuery<
    GetInteractionData,
    GetInteractionVars
  >(GET_INTERACTION, {
    variables: {
      workspaceId: workspace.id,
      interactionId: interactionId ?? "",
    },
    skip: !interactionId || skip,
  });

  return {
    interaction: data?.interaction ?? null,
    loading,
    error,
    hasId: Boolean(interactionId),
  };
}

