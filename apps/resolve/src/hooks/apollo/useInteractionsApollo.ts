
import { useQuery } from "@apollo/client";
import { GET_INTERACTIONS } from "../../graphql/queries/getInteractions";
import type { InteractionFilters } from "../../types/api";
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";

export function useInteractionsApollo({
  filters, 
  sortBy = "recent",
  page = 1,
  pageSize = 50,
  skip = false,
}: {
  filters: InteractionFilters, 
  sortBy?: string,
  page: number;
  pageSize: number;
  skip?: boolean;
}) {
  const workspace = useWorkspace();
  const offset = (page - 1) * pageSize;
  const { data, previousData, loading, error } = useQuery(GET_INTERACTIONS, {
      variables: {
        offset,
        limit: pageSize,
        filters,
        sortBy,
        workspaceId: workspace.id,
      },
      notifyOnNetworkStatusChange: true,
      skip,
    });

  const currentTotal = data?.interactions.pageInfo.total;
  const previousTotal = previousData?.interactions.pageInfo.total;

  return {
    interactions: data?.interactions.results ?? [],
    total: currentTotal ?? previousTotal ?? 0, 
    loading,
    error,
  };

}
