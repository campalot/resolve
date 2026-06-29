import { useAppStore } from "../store/useAppStore";
import { useInteractionActivitiesApollo } from "./apollo/useInteractionActivitiesApollo";
import { useInteractionActivitiesTanStack } from "./tanstack/useInteractionActivitiesTanStack";
import type { InteractionFilters } from "@resolve/types";

export function useInteractionActivities({ filters }: { filters: InteractionFilters }) {
  const strategy = useAppStore((state) => state.dataStrategy);

  // 1. Apollo Hook (Uses TypePolicy for merging)
  const apollo = useInteractionActivitiesApollo({ 
    filters, 
    skip: strategy !== 'APOLLO' 
  });

  // 2. TanStack Hook (Uses useInfiniteQuery for merging)
  const tanstack = useInteractionActivitiesTanStack({ 
    filters, 
    enabled: strategy === 'TANSTACK' 
  });

  // 3. Return a consistent object shape
  return strategy === 'APOLLO' ? apollo : tanstack;
}
