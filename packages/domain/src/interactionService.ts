import { 
  createInteractionCreatedActivity,
  getMockDb, 
  generateInteractionTitle, 
  randomId
 } from "@resolve/mock-db";
import { transitionInteraction as domainLogic, persistDbWithSync } from './logic'; // Your existing function
import { backendLogger } from '@resolve/logger';
// import { useAppStore } from '../../store/useAppStore';
import { ROLE_PERMISSIONS } from "@resolve/types";
import { resolveIdentity, resolveInteraction, resolveInteractionActivity, resolveProfileAssociations } from './common/resolvers';
import type { IdentityRecord, InteractionActivity, InteractionActivityRecord, InteractionRecord, InteractionType, ToastNotification } from '@resolve/types';
import { buildInteractionToastMessage } from "./buildInteractionMetadata";
import type { 
  InteractionDataRecord,
  CreateFormProps,
  ContractData,
  ProposalData,
  PolicyUpdateData,
  VendorOnboardingData,
  Role,
  TransitionVariables
} from "@resolve/types";
import { pickOne } from "@resolve/utils";

const createInteractionMetadata = (
  type: InteractionType,
  data: InteractionDataRecord
) => {
  switch (type) {
    case "CONTRACT":
      const contractData = data as ContractData;
      return {
          summary: contractData.summary,
          contractValue: contractData.contractValue,
          termLengthMonths: contractData.termLengthMonths,
          autoRenew: contractData.autoRenew,
        };

    case "PROPOSAL":
      const proposalData = data as ProposalData;
      return {
        summary: proposalData.summary,
        amount: proposalData.amount,
        currency: proposalData.currency,
        effectiveDate: proposalData.effectiveDate,
        expirationDate: proposalData.expirationDate,
      };

    case "POLICY_UPDATE":
      const policyData = data as PolicyUpdateData;
      return {
        summary: policyData.summary,
        policyArea: policyData.policyArea,
        effectiveDate: policyData.effectiveDate,
        impactLevel: policyData.impactLevel,
      };

    case "VENDOR_ONBOARDING":
      const vendorOnboardingData = data as VendorOnboardingData;
      return {
        summary: vendorOnboardingData.summary,
        vendorType: vendorOnboardingData.vendorType,
        riskLevel: vendorOnboardingData.riskLevel,
        onboardingChecklistComplete: vendorOnboardingData.onboardingChecklistComplete,
      };

    default:
      return null;
  }
};

export const interactionService = {
  executeTransition: async (vars: TransitionVariables) => {
    // 1. Start the group for both REST and GQL
    backendLogger.startGroup(`TransitionInteraction mutation`, { vars });
    backendLogger.latencyStart(250); 

    const { id, workspaceId, action, actorId, comment } = vars;
    const db = vars.db || getMockDb();
    
    // 2. Security Check
    const currentRole = vars.role || "Admin";
    const isAllowed = ROLE_PERMISSIONS[currentRole].includes(action);
    backendLogger.security(currentRole, action, isAllowed);

    if (!isAllowed) {
       backendLogger.latencyEnd(403);
       backendLogger.endGroup();
       throw { status: 403, message: `Security: Role '${currentRole}' unauthorized` };
    }

    // 3. Find Interaction
    const interactionIndex = db.interactions.findIndex((i: InteractionRecord) => i.id === id);
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

  getInteraction: async (workspaceId: string, interactionId: string, role?: Role) => {
    const db = getMockDb();
    const interaction = db.interactions.find(
      (i: InteractionRecord) => i.id === interactionId && i.workspaceId === workspaceId
    );

    if (!interaction) return null;

    // 2. Return the resolved shape
    return resolveInteraction(interaction, {
      role: role || "Admin"
    });
  },

  getProfileInteractions: async (workspaceId: string, identityId: string) => {
    return resolveProfileAssociations(workspaceId, identityId).interactions;
  },

  generateNewInteraction: async (workspaceId: string, identities: IdentityRecord[], formData: CreateFormProps) => {
    const currentDate = new Date().toISOString();
    const counterParties = formData.parties;
    const status = "DRAFT" as any;
    const currentReviewer = pickOne(identities);
    const type = formData.type;
    const data = createInteractionMetadata(formData.type, formData.data);

    const title = generateInteractionTitle(type, data);
    const newInteraction = {
      id: workspaceId + "_" + randomId(),
      workspaceId,
      title,
      type,
      data,
      parties: counterParties,
      status,
      updatedAt: currentDate,
      createdAt: currentDate,
      creatorId: formData.actorId,
      ...(status === "IN_REVIEW" && { currentReviewerId: currentReviewer.id }),
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    };

    const newActivities: InteractionActivityRecord[] = [];

    const actor = identities.find((ident) => ident.id === formData.actorId);

    const newActivity = createInteractionCreatedActivity(
      workspaceId,
      newInteraction,
      actor ? [actor] : identities,
    );

    if (newActivity) {
      newActivities.push(newActivity);
    }

    return {
      newInteraction,
      newActivities,
    }
  }
};