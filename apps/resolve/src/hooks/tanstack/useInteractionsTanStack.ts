import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";
import { getInteractionsList } from '../../api/endpoints/interactionsList';
import type { InteractionFilters } from "../../types/api";
import { interactionKeys } from '../queryKeys';

export function useInteractionsTanStack({ filters, sortBy = "recent", page = 1, pageSize = 50, enabled = true }: {
  filters: InteractionFilters, 
  sortBy?: string,
  page: number;
  pageSize: number;
  enabled?: boolean;
}) {
  const { id: workspaceId } = useWorkspace();
  const offset = (page - 1) * pageSize;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: interactionKeys.list(workspaceId, filters, sortBy, page),
    queryFn: () => getInteractionsList(workspaceId, offset, pageSize, filters, sortBy),
    enabled: !!workspaceId && enabled,
    placeholderData: (prev) => prev, // This replaces Apollo's specific previousData logic
  });

  return {
    interactions: data?.interactions?.results ?? [],
    loading: isLoading,
    isRefetching: isFetching, // Like notifyOnNetworkStatusChange
    error,
    total: data?.interactions?.pageInfo?.total ?? 0,
  };
}