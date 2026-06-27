import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../../store/useAppStore';
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";
import { getProfile } from '../../api/endpoints/profile';
import { profileKeys } from '../queryKeys';

export function useProfileTanStack({ identityId, enabled = true}: {identityId?: string, enabled: boolean}) {
  const workspace = useWorkspace();
  const activeRole = useAppStore((state) => state.activeRole);

  const { data, isLoading, error } = useQuery({
    queryKey: profileKeys.detail(workspace.id, identityId || '', activeRole),
    queryFn: () => getProfile(workspace.id, identityId!),
    enabled: !!identityId && !!workspace.id && enabled,
  });

  return {
    identity: data?.identity ?? null,
    interactions: data?.interactions ?? [],
    activities: data?.activities ?? [],
    loading: isLoading,
    error,
  };
}
