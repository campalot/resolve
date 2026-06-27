import { useAppStore } from '../store/useAppStore';
import { useProfileApollo } from './apollo/useProfileApollo';
import { useProfileTanStack } from './tanstack/useProfileTanStack';

export function useProfile(identityId?: string) {
  const strategy = useAppStore((state) => state.dataStrategy);

  // 1. Call both, but only "enable" the active one
  const apolloResult = useProfileApollo({
    identityId,
    skip: strategy !== 'APOLLO' // Standard Apollo skip
  });

  const tanstackResult = useProfileTanStack({
    identityId,
    enabled: strategy === 'TANSTACK' // Standard TanStack enabled
  });

  // 2. Return the data from the active one
  return strategy === 'APOLLO' ? apolloResult : tanstackResult;
}
