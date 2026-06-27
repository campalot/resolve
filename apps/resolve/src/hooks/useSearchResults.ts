import { useAppStore } from '../store/useAppStore';
import { useSearchApollo } from './apollo/useSearchApollo';
import { useSearchTanStack } from './tanstack/useSearchTanStack';

export function useSearchResults(queryString: string, limit: number = 10) {
  const strategy = useAppStore((state) => state.dataStrategy);
  
    // 1. Call both, but only "enable" the active one
      const apolloResult = useSearchApollo(
        queryString,
        limit,
        { skip: strategy !== 'APOLLO'},// Standard Apollo skip
      );
    
      const tanstackResult = useSearchTanStack(
        queryString,
        limit,
        {
          enabled: strategy === 'TANSTACK' // Standard TanStack enabled
        }
      );
    
      // 2. Return the data from the active one
      return strategy === 'APOLLO' ? apolloResult : tanstackResult;
}


