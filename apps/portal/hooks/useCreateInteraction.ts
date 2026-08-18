import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInteraction } from "@/api/endpoints/createInteraction";
import { interactionKeys } from "./queryKeys";

export function useCreateInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInteraction,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interactionKeys.lists() });
    },
  });
}