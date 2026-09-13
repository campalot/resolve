import { useQuery } from '@tanstack/react-query';
// import { useAppStore } from '../../store/useAppStore';
import { useWorkspace } from "@/contexts/Workspace/WorkspaceContext";
import { getInteraction } from '@/api/endpoints/interaction';
import { interactionKeys } from './queryKeys';

export function useInteraction(interactionId: string, { enabled }: { enabled: boolean}) {
  const workspace = useWorkspace();
  // const activeRole = useAppStore((state) => state.activeRole);
  const activeRole = "Admin";

  const { data, isLoading, error } = useQuery({
      queryKey: interactionKeys.detail(workspace.id, interactionId || '', activeRole),
      queryFn: () => getInteraction(workspace.id, interactionId!), // Keep this completely clean
      enabled: !!interactionId && !!workspace.id && enabled,
      
      // Retries are perfectly fine to keep for transient network gaps, 
      // but let it handle native network codes (like a 404 or 500) on its own.
      retry: 2, 
      retryDelay: 300,
    });

  return {
    interaction: data?.interaction ?? null,
    loading: isLoading,
    error,
    hasId: Boolean(interactionId),
  };
}

