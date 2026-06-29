import { useAppStore } from "../store/useAppStore";
import { useIdentitiesApollo } from "./apollo/useIdentitiesApollo";
import { useIdentitiesTanStack } from "./tanstack/useIdentitiesTanStack";
import type { IdentityFilters } from "@resolve/types";

export type IdentitiesListProps = {
  filters: IdentityFilters, 
  sortBy?: string,
  page: number;
  pageSize: number;
}

export function useIdentities(params: IdentitiesListProps) {
  const strategy = useAppStore((state) => state.dataStrategy);

  // 1. Call both, but only "enable" the active one
  const apolloResult = useIdentitiesApollo({
    ...params,
    skip: strategy !== 'APOLLO' // Standard Apollo skip
  });

  const tanstackResult = useIdentitiesTanStack({
    ...params,
    enabled: strategy === 'TANSTACK' // Standard TanStack enabled
  });

  // 2. Return the data from the active one
  return strategy === 'APOLLO' ? apolloResult : tanstackResult;
}
