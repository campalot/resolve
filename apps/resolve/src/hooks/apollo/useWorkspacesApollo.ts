
import { useQuery } from "@apollo/client";
import { GET_WORKSPACES } from "../../graphql/queries/getWorkspaces";

export function useWorkspacesApollo({ skip = false}) {
  const { data, loading, error } = useQuery(GET_WORKSPACES, {
    fetchPolicy: 'cache-first',
    skip,
  });

  return {
    workspaces: data?.workspaces ?? [],
    loading,
    error,
  };

}
