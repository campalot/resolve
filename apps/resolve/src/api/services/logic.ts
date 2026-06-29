import type { 
  InteractionAction, 
  InteractionActivityRecord,
  InteractionRecord,
} from "@resolve/types";
import { getMockDb } from "../../mocks/mockDB";
import { WORKFLOW } from "../mocks/common/constants";
import { ACTION_TO_STATUS } from "@resolve/types";
import { pickOne } from "../../helpers";
import { 
  createCommentAddedActivity, 
  createStatusChangedActivity, 
  createReviewerAssignedActivity,
  createDecisionActivity,
} from "../../mocks/mockActivities";


function getNextReviewer(
  interaction: InteractionRecord,
  actorId: string): string {
  const mockDb = getMockDb();
  // Demo logic:
  // To widen the variety of options, picking next review 
  // from amongst ineraction parties or company employees
  const actorCompanyId = mockDb.identities.find((i) => i.id === actorId)?.companyId;
  const companyEmployees = mockDb.identities.filter((i) => i.type === "Individual" && i.companyId === actorCompanyId);
  const reviewers = interaction.parties.map((p) => p.identityId).concat(companyEmployees.map((e) => e.id));
  return pickOne(reviewers);
}

export type TransitionResult = {
  updatedInteraction: InteractionRecord;
  newActivities: InteractionActivityRecord[];
};
export function transitionInteraction(
  interaction: InteractionRecord,
  action: InteractionAction,
  actorId: string,
  workspaceId: string,
  comment?: string,
): TransitionResult {
  const mockDb = getMockDb();

  // --- ADD THIS BLOCK HERE ---
  const targetStatus = ACTION_TO_STATUS[action];
  if (interaction.status === targetStatus) {
    console.warn(`Interaction ${interaction.id} is already ${targetStatus}. Skipping transition.`);
    return { 
      updatedInteraction: interaction, 
      newActivities: [] 
    };
  }
  // --- END OF NEW BLOCK ---
  
  const allowed = WORKFLOW[interaction.status].allowedActions;

  if (!allowed.includes(action)) {
    throw new Error(
      `Action ${action} not allowed from status ${interaction.status}`
    );
  }

  const nextStatus = ACTION_TO_STATUS[action];
  const now = new Date().toISOString();

  const updatedInteraction: InteractionRecord = {
    ...interaction,
    status: nextStatus,
    updatedAt: now,
    currentReviewerId: nextStatus === "IN_REVIEW"
      ? getNextReviewer(interaction, actorId)
      : undefined,
  };

  const newActivities: InteractionActivityRecord[] = [];

  const actor = mockDb.identities.find((ident) => ident.id === actorId);

  // If there's no actor, we can't attribute the event, so we stop here.
  if (!actor) {
    console.warn(`Actor ${actorId} not found. Returning original state.`);
    // Return the interaction unchanged and an empty activities array
    return { 
      updatedInteraction: interaction, 
      newActivities: [] 
    };
  }

  // Add the User Feedback as a separate Activity record if provided
  if (comment && comment.trim().length > 0) {
    const commentActivity = createCommentAddedActivity(
      workspaceId,
      interaction,
      [actor],
      comment,
      now
    );
    newActivities.push(commentActivity);
  }

  if (action === "SUBMIT" || action === "RESUBMIT") {
    const previousStatus = interaction.status;
    const reviewer = actor;
    interaction.currentReviewerId = reviewer?.id;
    const newActivityStatus = createStatusChangedActivity(
      workspaceId,
      interaction,
      previousStatus,
      "IN_REVIEW",
      now,
      [actor]
    );
    const newActivityReviewer = createReviewerAssignedActivity(
      workspaceId,
      interaction,
      reviewer,
      now,
      [actor]
    );
    newActivities.push(newActivityStatus);
    newActivities.push(newActivityReviewer);

  } else if (action === "APPROVE" || action === "REJECT") {
    const newActivityDecision = createDecisionActivity(
      workspaceId,
      interaction,
      actor,
      nextStatus,
      now,
      [actor]
    );

    newActivities.push(newActivityDecision);
  }

  return {
    updatedInteraction,
    newActivities,
  };
}