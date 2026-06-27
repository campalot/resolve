import { useInteractionApollo } from "./apollo/useInteractionApollo";
import { useInteractionTanStack } from "./tanstack/useInteractionTanStack";
import { useAppStore } from "../store/useAppStore";

export function useInteraction(id: string) {
  const strategy = useAppStore((state) => state.dataStrategy);

  // Call both with the 'enabled/skip' pattern
  const apollo = useInteractionApollo(id, { skip: strategy !== 'APOLLO'});
  const tanstack = useInteractionTanStack(id, { enabled: strategy === 'TANSTACK'});

  return strategy === 'APOLLO' ? apollo : tanstack;
}
