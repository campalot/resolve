
import { useQuery } from "@tanstack/react-query";
import { useWorkspace } from "../../contexts/Workspace/WorkspaceContext";
import { referenceKeys } from "../queryKeys";
import { getInteractionsReferenceData } from "../../api/endpoints/reference";

export function useReferenceDataTanStack({ enabled = true}) {
  const { id: workspaceId } = useWorkspace();

  const { data } = useQuery({
    queryKey: referenceKeys.interactions(workspaceId),
    queryFn: () => getInteractionsReferenceData(workspaceId),
    staleTime: 1000 * 60 * 5, // 5 minutes (reference data doesn't change often)
    enabled: !!workspaceId && enabled,
  });

  return {
    parties: data?.parties ?? [],
    statuses: data?.interactionStatuses ?? [],
    types: data?.interactionTypes ?? [],
  };

}
