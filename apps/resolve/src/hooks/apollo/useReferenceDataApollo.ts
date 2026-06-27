
import { useQuery } from "@apollo/client";
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";
import { GET_INTERACTIONS_REFERENCE_DATA } from "../../graphql/queries/InteractionsReferenceData";

export function useReferenceDataApollo({ skip = false}) {
  const workspace = useWorkspace();
  const { data } = useQuery(GET_INTERACTIONS_REFERENCE_DATA, {
    variables: {
      workspaceId: workspace.id,
    },
    fetchPolicy: "cache-and-network",
    skip,
  });

  return {
    parties: data?.parties ?? [],
    statuses: data?.interactionStatuses ?? [],
    types: data?.interactionTypes ?? [],
  };

}
