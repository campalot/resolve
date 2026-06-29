import type { Interaction } from "@resolve/types";
import { useAppStore } from "../store/useAppStore";
import { useTransitionApollo } from "./apollo/useTransitionApollo";
import { useTransitionTanStack } from "./tanstack/useTransitionTanStack";

export function useTransitionInteraction(interaction: Interaction) {
  const strategy = useAppStore((state) => state.dataStrategy);

  const apollo = useTransitionApollo(interaction);
  const tanstack = useTransitionTanStack(interaction);

  // Return the active one. Both must provide: { mutate, isLoading }
  return strategy === "APOLLO" ? apollo : tanstack;
}
