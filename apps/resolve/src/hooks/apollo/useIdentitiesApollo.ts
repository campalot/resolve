
import { useQuery } from "@apollo/client";
import { GET_IDENTITIES } from "../../graphql/queries/getIdentities";
import type { IdentityFilters } from "@resolve/types";
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";

export function useIdentitiesApollo({
  filters, 
  sortBy = "name",
  page = 1,
  pageSize = 12,
  skip = false,
}: {
  filters: IdentityFilters, 
  sortBy?: string,
  page: number;
  pageSize: number;
  skip?: boolean;
}) {
  const workspace = useWorkspace();
  const offset = (page - 1) * pageSize;
  const { data, previousData, error, networkStatus } = useQuery(GET_IDENTITIES, {
      variables: {
        offset,
        limit: pageSize,
        filters,
        sortBy,
        workspaceId: workspace.id,
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
      skip,
    });

  const loading = networkStatus === 1 && !data;
  const activeData = data || previousData;

  return {
    identities: activeData?.identities.results ?? [],
    total: activeData?.identities.pageInfo.total ?? 0,
    loading,
    isRefetching: networkStatus === 4,
    isChangingParams: networkStatus === 2,
    error,
  };

}
