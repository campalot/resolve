import { useAppStore } from "../store/useAppStore";
import { useWorkspacesApollo } from "./apollo/useWorkspacesApollo";
import { useWorkspacesTanStack } from "./tanstack/useWorkspacesTanStack";

export function useWorkspacesList() {
  const strategy = useAppStore((state) => state.dataStrategy);

  // 1. Call both, but only "enable" the active one
    const apolloResult = useWorkspacesApollo({
      skip: strategy !== 'APOLLO' // Standard Apollo skip
    });
  
    const tanstackResult = useWorkspacesTanStack({
      enabled: strategy === 'TANSTACK' // Standard TanStack enabled
    });
  
    // 2. Return the data from the active one
    return strategy === 'APOLLO' ? apolloResult : tanstackResult;
  }
