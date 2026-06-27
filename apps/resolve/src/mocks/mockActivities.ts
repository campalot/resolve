import { ACTION_TO_STATUS, WORKFLOW } from "../types/schema";
import type { 
  InteractionAction, 
  InteractionRole, 
  InteractionState, 
} from "../types/schema";
import type { 
  InteractionActivityRecord,
  InteractionRecord,
  InteractionPartyRecord,
  IdentityRecord,
 } from "../types/api";
import { generateRandomDateStringPriorTo, getRandomDate, getRandomInteger, pickOne } from "../helpers";
import { getMockDb } from "./mockDB";

export type LifecycleTimestamps = {
  created?: string;
  review?: string;
  decision?: string;
};

const loremText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque sit amet accumsan arcu. Cras interdum suscipit neque, in cursus purus pretium vel. Suspendisse potenti.";

function getLifecycleTimestamps(baseDate: string, finalStatus: InteractionState): LifecycleTimestamps {
  const decision = baseDate;

  if (finalStatus === "DRAFT") {
    return { created: decision };
  }

  const review = generateRandomDateStringPriorTo(decision);

  if (finalStatus === "IN_REVIEW") {
    return {
      created: generateRandomDateStringPriorTo(review),
      review,
    };
  }

  return {
    created: generateRandomDateStringPriorTo(review),
    review,
    decision,
  };
}

function pickActorFromInteraction(
  interaction: InteractionRecord,
  identities: IdentityRecord[]
): IdentityRecord | undefined {
  const party = pickOne(interaction.parties);
  const actor = identities.find(i => i.id === party.identityId);
  if (actor?.type === "Individual") {
    return actor;
  }
  // const employees = identities.find((i) => i.companyId === party.identityId);
  // return Array.isArray(employees) ? pickOne(employees) : employees;

  const employees = identities.filter(
    (i) => i.companyId === party.identityId
  );

  return employees.length > 0
    ? pickOne(employees)
    : undefined;
}

export function createInteractionCreatedActivity(
  workspaceId: string,
  interaction: InteractionRecord,
  identities: IdentityRecord[]
): InteractionActivityRecord {
  const actor = pickActorFromInteraction(interaction, identities);

  if (!actor) throw new Error("Actor not found");

  return {
    __typename: 'InteractionActivityRecord',
    id: `activity-${crypto.randomUUID()}`,
    workspaceId,
    interactionId: interaction.id,
    interactionTitle: interaction.title,
    type: 'INTERACTION_CREATED',
    occurredAt: interaction.createdAt,
    actorId: actor.id,
    metadata: {
      __typename: 'InteractionActivityMetadata_Created',
    },
  };
}

export function createStatusChangedActivity(
  workspaceId: string,
  interaction: InteractionRecord,
  previousStatus: InteractionState,
  newStatus: InteractionState,
  occurredAt: string,
  identities: IdentityRecord[]
): InteractionActivityRecord {
  const actor = identities.length === 1 ? identities[0] : pickActorFromInteraction(interaction, identities);

  if (!actor) throw new Error("Actor not found");

  return {
    __typename: 'InteractionActivityRecord',
    id: `activity-${crypto.randomUUID()}`,
    workspaceId,
    interactionId: interaction.id,
    interactionTitle: interaction.title,
    type: 'STATUS_CHANGED',
    occurredAt,
    actorId: actor.id,
    metadata: {
      __typename: 'InteractionActivityMetadata_Status',
      previousStatus,
      newStatus,
    },
  };
}

export function createReviewerAssignedActivity(
  workspaceId: string,
  interaction: InteractionRecord,
  reviewer: IdentityRecord,
  occurredAt: string,
  identities: IdentityRecord[]
): InteractionActivityRecord {
  const actor = identities.length === 1 ? identities[0] : pickActorFromInteraction(interaction, identities);
  const roles = ["Buyer", "Seller", "Partner"];
  const role = roles[Math.floor(Math.random() * roles.length)];
  const nextReviewerPartyRecord: InteractionPartyRecord = { identityId: reviewer["id"], role: role as InteractionRole };

  if (!actor) throw new Error("Actor not found");

  return {
    __typename: 'InteractionActivityRecord',
    id: `activity-${crypto.randomUUID()}`,
    workspaceId,
    interactionId: interaction.id,
    interactionTitle: interaction.title,
    type: 'REVIEWER_ASSIGNED',
    occurredAt,
    actorId: actor.id,
    metadata: {
      __typename: 'InteractionActivityMetadataRecord_Reviewer',
      nextReviewer: nextReviewerPartyRecord,
    },
  };
}

export function createDecisionActivity(
  workspaceId: string,
  interaction: InteractionRecord,
  decisionMaker: IdentityRecord,
  finalStatus: InteractionState,
  occurredAt: string,
  identities: IdentityRecord[]
): InteractionActivityRecord {
  const actor = identities.length === 1 ? identities[0] : pickActorFromInteraction(interaction, identities);

  if (!actor) throw new Error("Actor not found");

  return {
    __typename: 'InteractionActivityRecord',
    id: `activity-${crypto.randomUUID()}`,
    workspaceId,
    interactionId: interaction.id,
    interactionTitle: interaction.title,
    type: 'INTERACTION_DECIDED',
    occurredAt,
    actorId: actor.id,
    metadata: {
      __typename: 'InteractionActivityMetadataRecord_Decision',
      finalStatus,
      decisionMakerId: decisionMaker.id,
    },
  };
}

export function createCommentAddedActivity(
  workspaceId: string,
  interaction: InteractionRecord,
  identities: IdentityRecord[],
  body?: string, // Pass the comment
  occurred?: string, 
): InteractionActivityRecord {
  const actor = identities.length === 1 ? identities[0] : pickActorFromInteraction(interaction, identities);
  const occurredAt = occurred || getRandomDate(interaction.createdAt, interaction.updatedAt).toISOString();

  if (!actor) throw new Error("Actor not found");

  return {
    __typename: 'InteractionActivityRecord',
    id: `activity-${crypto.randomUUID()}`,
    workspaceId,
    interactionId: interaction.id,
    interactionTitle: interaction.title,
    type: 'COMMENT_ADDED',
    occurredAt,
    actorId: actor.id,
    metadata: {
      __typename: 'InteractionActivityMetadata_Comment',
      commentExcerpt: body || loremText,
    },
  };
}

function generateInteractionLifecycle({
  workspaceId, interaction, identities,
}: {
  workspaceId: string;
  interaction: InteractionRecord;
  identities: IdentityRecord[];
}) {
  const activities: InteractionActivityRecord[] = [];

  const finalStatus = pickOne([
    "DRAFT",
    "IN_REVIEW",
    "APPROVED",
    "REJECTED",
  ] as InteractionState[]);

  const creator = pickActorFromInteraction(interaction, identities);
  const activityTimestamps = getLifecycleTimestamps(interaction.updatedAt, finalStatus);

  // Always starts as DRAFT
  interaction.status = "DRAFT";
  interaction.currentReviewerId = null;
  interaction.creatorId = creator?.id || "";
  interaction.createdAt = activityTimestamps.created || "";

  // 1️⃣ Created
  activities.push(
    createInteractionCreatedActivity(workspaceId, interaction, identities)
  );

  if (finalStatus === "DRAFT") {
    return activities;
  }

  // 2️⃣ Move to IN_REVIEW
  const reviewer = pickActorFromInteraction(interaction, identities)!;

  const previousStatus = interaction.status;
  interaction.status = "IN_REVIEW";
  interaction.currentReviewerId = reviewer?.id;

  activities.push(
    createStatusChangedActivity(
      workspaceId,
      interaction,
      previousStatus,
      "IN_REVIEW",
      activityTimestamps.review || "",
      identities
    )
  );

  activities.push(
    createReviewerAssignedActivity(
      workspaceId,
      interaction,
      reviewer,
      activityTimestamps.review as string,
      identities
    )
  );

  if (finalStatus === "IN_REVIEW") {
    return activities;
  }

  // 3️⃣ Approved or Rejected
  const decisionMaker = reviewer; // minimal logic

  interaction.status = finalStatus;
  interaction.currentReviewerId = null;

  activities.push(
    createDecisionActivity(
      workspaceId,
      interaction,
      decisionMaker,
      finalStatus,
      activityTimestamps.decision as string,
      identities
    )
  );

  return activities;
}

export function generateActivities(
  workspaceId: string,
  interactions: InteractionRecord[],
  identities: IdentityRecord[]
): InteractionActivityRecord[] {
  const activities: InteractionActivityRecord[] = [];

  interactions.forEach(interaction => {
    const lifecycleActivities = generateInteractionLifecycle({
      workspaceId,
      interaction,
      identities,
    });

    activities.push(...lifecycleActivities);

    if (interaction.status !== "DRAFT") {
      const commentCount = getRandomInteger(0, 2);

      for (let i = 0; i < commentCount; i++) {
        activities.push(
          createCommentAddedActivity(workspaceId, interaction, identities)
        );
      }
    }
  });

  return activities.sort(
    (a, b) => new Date(b.occurredAt).getTime() -
      new Date(a.occurredAt).getTime()
  );
}

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

