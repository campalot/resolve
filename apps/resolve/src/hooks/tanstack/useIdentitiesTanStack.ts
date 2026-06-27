import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getIdentities } from "../../api/endpoints/identities"; // You'll create this Axios call
import { identityKeys } from "../queryKeys";
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";
import type { IdentityFilters } from "../../types/api";

export function useIdentitiesTanStack({
  filters, 
  sortBy = "name",
  page = 1,
  pageSize = 12,
  enabled = true,
}: {
  filters: IdentityFilters, 
  sortBy?: string,
  page: number;
  pageSize: number;
  enabled?: boolean;
}) {
  const { id: workspaceId } = useWorkspace();
  const offset = (page - 1) * pageSize;

  const { data, error, isPlaceholderData, isFetching, isLoading } = useQuery({
    queryKey: identityKeys.list(workspaceId, filters, sortBy, page),
    queryFn: () => getIdentities(workspaceId, offset, pageSize, filters, sortBy),
    enabled,
    placeholderData: keepPreviousData, // Replaces Apollo's 'previousData' behavior
  });

  return {
    identities: data?.identities?.results ?? [],
    total: data?.identities?.pageInfo?.total ?? 0,
    loading: isLoading,
    isRefetching: isFetching,
    // matches previous logic for 'isSorting' or 'isFiltering'
    isChangingParams: isFetching && isPlaceholderData, 
    error,
  };
}
