import { http, graphql, HttpResponse } from 'msw';
import { interactionService } from '../../services/interactionService';
import type { InteractionAction, Interaction } from '../../../types/schema';
import { withMockBehavior } from '../common/withMockBehavior';

export type TransitionVariables = {
  id: string;
  action: InteractionAction; // Or your specific Action enum
  actorId: string;
  workspaceId: string;
  comment?: string;
}

type TransitionResponse = {
  transitionInteraction: Interaction;
}

export const transitionHandlers = [
  // REST (POST)
http.post<{ id: string; workspaceId: string }>('/api/w/:workspaceId/interactions/:id/transition', async ({ params, request }) => {
  return withMockBehavior(async () => {
    const body = (await request.json()) as TransitionVariables;
    const result = await interactionService.executeTransition({
      id: params.id as string,
      workspaceId: params.workspaceId as string,
      action: body.action,
      actorId: body.actorId,
      comment: body.comment
    } as TransitionVariables);
    return HttpResponse.json(result);
  }); 
}),

// GRAPHQL (Mutation)
graphql.mutation<TransitionResponse, TransitionVariables>('TransitionInteraction', async ({ variables }) => {
  try {
    return withMockBehavior(async () => {
      console.info("🚀 Handler received variables:", variables);
      
      const result = await interactionService.executeTransition(variables as TransitionVariables);
      
      console.info("✅ Service returned:", result);
      return HttpResponse.json({ data: result });
    });  
  } catch (error) {
    // THIS IS THE SMOKING GUN
    console.error("❌ SERVICE CRASHED:", error);
    const message = error instanceof Error ? error.message : "Unknown Service Error";
    return HttpResponse.json({ 
      errors: [{ message }] 
    });
  }
})
];
