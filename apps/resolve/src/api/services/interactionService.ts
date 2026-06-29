import { getMockDb, persistDb } from '../../mocks/mockDB';
import { transitionInteraction as domainLogic } from './logic'; // Your existing function
import type { TransitionVariables } from '../mocks/features/transitionhandlers';
import { backendLogger } from '../logger';
import { useAppStore } from '../../store/useAppStore';
import { ROLE_PERMISSIONS } from "@resolve/types";
import { resolveIdentity, resolveInteraction, resolveInteractionActivity } from '../mocks/common/resolvers';
import type { IdentityRecord, InteractionActivity, ToastNotification } from '@resolve/types';
import { buildInteractionToastMessage } from '../../pages/InteractionDetail/buildInteractionMetadata';

export const interactionService = {
  executeTransition: async (vars: TransitionVariables) => {
    // 1. Start the group for both REST and GQL
    backendLogger.startGroup(`TransitionInteraction mutation`, { vars });
    backendLogger.latencyStart(250); 

    const { id, workspaceId, action, actorId, comment } = vars;
    const db = getMockDb();
    
    // 2. Security Check
    const currentRole = useAppStore.getState().activeRole;
    const isAllowed = ROLE_PERMISSIONS[currentRole].includes(action);
    backendLogger.security(currentRole, action, isAllowed);

    if (!isAllowed) {
       backendLogger.latencyEnd(403);
       backendLogger.endGroup();
       throw { status: 403, message: `Security: Role '${currentRole}' unauthorized` };
    }

    // 3. Find Interaction
    const interactionIndex = db.interactions.findIndex(i => i.id === id);
    if (interactionIndex === -1) {
       backendLogger.endGroup();
       throw { status: 404, message: "Not found" };
    }

    // 4. Run Domain Logic
    const { updatedInteraction, newActivities } = domainLogic(
      db.interactions[interactionIndex],
      action,
      actorId,
      workspaceId,
      comment
    );
    backendLogger.sideEffect(`Generated ${newActivities.length} activity records`, newActivities);

    // 5. Mutation / Persistence
    db.interactions[interactionIndex] = updatedInteraction;
    db.interactionActivities.unshift(...newActivities);
    persistDb(db);
    backendLogger.storage("Throttled save queued to LocalStorage");

    // 6. Resolve Response
    const resolvedInteraction = resolveInteraction(updatedInteraction);
    const actorRecord = db.identities.find((i: IdentityRecord) => i.id === actorId);
    if (!actorRecord) {
      backendLogger.error(`Actor lookup failed for ID: ${actorId}`);
      backendLogger.endGroup();
      throw { status: 404, message: "Identity not found" }; 
    }

    // Now 'actor' is strictly defined. No more '?' or '||' needed!
    const actor = resolveIdentity(actorRecord);
    
    // ... Build notifications and resolvedActivities here ...
    const notifications: ToastNotification[] = [];
    
    notifications.push({
    __typename: "ToastNotification",
    message: buildInteractionToastMessage(resolvedInteraction, actor?.name),
    type: action === 'APPROVE' ? 'success' : 'info'
    });

    // Conditional "Reviewer Added" Toast
    if (resolvedInteraction.currentReviewer && action === 'SUBMIT') {
    notifications.push({
        __typename: "ToastNotification",
        message: buildInteractionToastMessage(resolvedInteraction, resolvedInteraction.currentReviewer?.name || "Unknown reviewer", true),
        type: 'info'
    });
    }

    // Conditional "Comment Added" Toast
    if (comment && comment.trim()) {
    notifications.push({
        __typename: "ToastNotification",
        message: `${actor?.name} successfully commented on the interaction.`,
        type: 'info'
    });
    }

    const resolvedActivities = newActivities
    .map(activity => resolveInteractionActivity(activity))
    .filter((activity): activity is InteractionActivity => activity !== null)

    const finalData = {
        ...resolvedInteraction,
        __typename: "Interaction" as const, 
        notifications,
        activities: resolvedActivities,
    };

    backendLogger.latencyEnd(200);
    backendLogger.endGroup();
    return { transitionInteraction: finalData };
  },

  getInteraction: async (workspaceId: string, interactionId: string) => {
    const db = getMockDb();
    const interaction = db.interactions.find(
      (i) => i.id === interactionId && i.workspaceId === workspaceId
    );

    if (!interaction) return null;

    // 2. Return the resolved shape
    return resolveInteraction(interaction);
  }
};
