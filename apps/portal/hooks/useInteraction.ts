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
      queryFn: async () => {
      const response = await getInteraction(workspace.id, interactionId!);
      
      // STORAGE AGNOSTIC CHECK: 
      // If the endpoint returns a 200 success but the interaction data structure 
      // is completely missing or blank, the persistence layer hasn't finalized the write yet.
      // Throw a custom error to force a React Query retry
      if (!response?.interaction) {
        throw new Error("DATA_NOT_READY");
      }
      
      return response;
    },
    enabled: !!interactionId && !!workspace.id && enabled,
    
    // Smart Retry Configuration:
    retry: (failureCount, error) => {
      // Only retry up to 3 times if it's our specific replication lag error
      if (error.message === "DATA_NOT_READY" && failureCount < 3) {
        return true;
      }
      return false; // Fail immediately for legitimate auth/network errors
    },
    retryDelay: (attempt) => attempt * 300, // Wait 300ms, then 600ms, then 900ms
    });

  return {
    interaction: data?.interaction ?? null,
    loading: isLoading,
    error,
    hasId: Boolean(interactionId),
  };
}

