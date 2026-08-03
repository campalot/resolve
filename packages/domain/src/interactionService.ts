// import { getMockDb, persistDb } from '../../mocks/mockDB';
import { 
  getMockDb, 
  generateInteractionTitle, 
  randomCounterparties,
  randomId
 } from "@resolve/mock-db";
import { transitionInteraction as domainLogic, persistDbWithSync } from './logic'; // Your existing function
// import type { TransitionVariables } from '../mocks/features/transitionhandlers';
import { backendLogger } from '@resolve/logger';
// import { useAppStore } from '../../store/useAppStore';
import { ROLE_PERMISSIONS } from "@resolve/types";
import { resolveIdentity, resolveInteraction, resolveInteractionActivity, resolveProfileAssociations } from './common/resolvers';
import type { IdentityRecord, InteractionActivity, ToastNotification } from '@resolve/types';
import { buildInteractionToastMessage } from "./buildInteractionMetadata";
import type { InteractionAction } from "@resolve/types";
import { pickOne } from "@resolve/utils";

//TEMPORARY UNTIL I FIGURE OUT ALL CONNECTIONS 
export type TransitionVariables = {
  id: string;
  action: InteractionAction; // Or your specific Action enum
  actorId: string;
  workspaceId: string;
  comment?: string;
}

export const interactionService = {
  executeTransition: async (vars: TransitionVariables) => {
    // 1. Start the group for both REST and GQL
    backendLogger.startGroup(`TransitionInteraction mutation`, { vars });
    backendLogger.latencyStart(250); 

    const { id, workspaceId, action, actorId, comment } = vars;
    const db = getMockDb();
    
    // 2. Security Check
    // const currentRole = useAppStore.getState().activeRole;
    const currentRole = "Admin";
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
    //persistDb(db);
    persistDbWithSync(db, {
      delay: 500,
    });
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
    // message: `test ${actor?.name}`,
    type: action === 'APPROVE' ? 'success' : 'info'
    });

    // Conditional "Reviewer Added" Toast
    if (resolvedInteraction.currentReviewer && action === 'SUBMIT') {
    notifications.push({
        __typename: "ToastNotification",
        message: buildInteractionToastMessage(resolvedInteraction, resolvedInteraction.currentReviewer?.name || "Unknown reviewer", true),
        // message: `test ${actor?.name}`,
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
    // return { transitionInteraction: finalData };
    return finalData;
  },

  getInteraction: async (workspaceId: string, interactionId: string) => {
    const db = getMockDb();
    const interaction = db.interactions.find(
      (i) => i.id === interactionId && i.workspaceId === workspaceId
    );

    if (!interaction) return null;

    // 2. Return the resolved shape
    return resolveInteraction(interaction);
  },

  getProfileInteractions: async (workspaceId: string, identityId: string) => {
    return resolveProfileAssociations(workspaceId, identityId).interactions;
  },

  generatePolicyUpdate: async (workspaceId: string, identities: IdentityRecord[], formData: any) => {
    const randomDate = new Date(
      Date.now() - Math.floor(Math.random() * 10000000000)
    ).toLocaleString();
    const currentDate = new Date().toISOString();
    // const randomCreateDate = new Date(
    //   new Date(randomDate).getTime() - Math.floor(Math.random() * 10000000000)
    // ).toLocaleString();
    const counterParties = randomCounterparties(identities);
    const status = "DRAFT" as any;
    const currentReviewer = pickOne(identities);
    const type = "POLICY_UPDATE";
    const data = {
      summary: formData.summary,
      policyArea: formData.policyArea,
      effectiveDate: formData.effectiveDate,
      impactLevel: formData.impactLevel,
    };

    const title = generateInteractionTitle(type, data);
  
    return ({
      id: workspaceId + "_" + randomId(),
      workspaceId,
      title: "ALEX " + title,
      type,
      data,
      parties: counterParties,
      status,
      updatedAt: currentDate,
      createdAt: currentDate,
      creatorId: pickOne(counterParties).identityId,
      ...(status === "IN_REVIEW" && { currentReviewerId: currentReviewer.id }),
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    })
  }
};
