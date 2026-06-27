import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../../store/useAppStore';
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";
import { getInteraction } from '../../api/endpoints/interaction';
import { interactionKeys } from '../queryKeys';

export function useInteractionTanStack(interactionId: string, { enabled }: { enabled: boolean}) {
  const workspace = useWorkspace();
  const activeRole = useAppStore((state) => state.activeRole);

  const { data, isLoading, error } = useQuery({
      queryKey: interactionKeys.detail(workspace.id, interactionId || '', activeRole),
      queryFn: () => getInteraction(workspace.id, interactionId!),
      enabled: !!interactionId && !!workspace.id && enabled,
    });

  return {
    interaction: data?.interaction ?? null,
    loading: isLoading,
    error,
    hasId: Boolean(interactionId),
  };
}

