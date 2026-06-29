import { useInteractionsApollo } from './apollo/useInteractionsApollo';
import { useInteractionsTanStack } from './tanstack/useInteractionsTanStack';
import { useAppStore } from '../store/useAppStore';
import type { InteractionFilters } from "@resolve/types";

type UseInteractionsProps = {
  filters: InteractionFilters, 
  sortBy?: string,
  page: number;
  pageSize: number;
};

export function useInteractions(params: UseInteractionsProps) {
  const strategy = useAppStore((state) => state.dataStrategy);

  // 1. Call both, but only "enable" the active one
  const apolloResult = useInteractionsApollo({
    ...params,
    skip: strategy !== 'APOLLO' // Standard Apollo skip
  });

  const tanstackResult = useInteractionsTanStack({
    ...params,
    enabled: strategy === 'TANSTACK' // Standard TanStack enabled
  });

  // 2. Return the data from the active one
  return strategy === 'APOLLO' ? apolloResult : tanstackResult;
}