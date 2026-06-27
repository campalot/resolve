import { useQuery } from "@tanstack/react-query";
import { getWorkspaces } from "../../api/endpoints/workspaces";
import { workspaceKeys } from "../queryKeys";

export function useWorkspacesTanStack({ enabled = true }) {
  const { data, isLoading, error } = useQuery({
    queryKey: workspaceKeys.all,
    queryFn: getWorkspaces,
    enabled,
    // Workspaces rarely change during a session
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });

  return {
    workspaces: data?.workspaces ?? [],
    loading: isLoading,
    error,
  };
}
