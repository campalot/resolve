import { useQuery } from "@apollo/client";
import { GET_PROFILE } from "../../graphql/queries/getProfile";
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";

export function useProfileApollo({ identityId, skip = false }: {identityId?: string, skip: boolean}) {
  const workspace = useWorkspace();
  const { data, loading, error } = useQuery(GET_PROFILE, {
      variables: {
        workspaceId: workspace.id,
        identityId: identityId ?? "",
      },
      fetchPolicy: "cache-and-network",
      skip: !identityId || skip,
    });

  return {
    identity: data?.identity ?? null,
    interactions: data?.interactions ?? [],
    activities: data?.activities ?? [],
    loading,
    error,
  };

}
