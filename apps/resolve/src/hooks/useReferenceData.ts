import { useAppStore } from "../store/useAppStore";
import { useReferenceDataApollo } from "./apollo/useReferenceDataApollo";
import { useReferenceDataTanStack } from "./tanstack/useReferenceDataTanStack";

export function useReferenceData() {
  const strategy = useAppStore((state) => state.dataStrategy);

  // 1. Call both, but only "enable" the active one
    const apolloResult = useReferenceDataApollo({
      skip: strategy !== 'APOLLO' // Standard Apollo skip
    });
  
    const tanstackResult = useReferenceDataTanStack({
      enabled: strategy === 'TANSTACK' // Standard TanStack enabled
    });
  
    // 2. Return the data from the active one
    return strategy === 'APOLLO' ? apolloResult : tanstackResult;
  }
