import type { 
  Identity, 
  Interaction,
  InteractionActivity,
  InteractionParty, 
  InteractionState,
  InteractionAction,
} from "../../../types/schema";
import type { Role } from "../../cache";
import type {
  InteractionActivityRecord,
  InteractionActivityMetadataRecord_Decision
} from "../../../types/api";
import type { InteractionActivityMetadataRecord_Reviewer } from "../../../types/api";
import type { InteractionRecord } from "../../../types/api";
import type { InteractionPartyRecord } from "../../../types/api";
import type { IdentityRecord } from "../../../types/api";
import { getMockDb } from "../../../mocks/mockDB";
import { WORKFLOW } from "./constants";
import { ROLE_PERMISSIONS } from "../../../types/schema";
import { useAppStore } from '../../../store/useAppStore';

type IdentityStats = {
  total: number;
  active: number;
  awaiting: number;
  lastActivityAt: number | null;
}

export function getPermittedActions(
  status: InteractionState,
  role: Role
): InteractionAction[] {
  const workflowActions = WORKFLOW[status]?.allowedActions || [];

  return workflowActions.filter(action =>
    ROLE_PERMISSIONS[role].includes(action)
  );
}

export function getProfileInteractionsAndActivities(
  workspaceId: string, 
  identityId: string,
  options?: {
    db?: ReturnType<typeof getMockDb>;
  }
) {
  const mockDb = options?.db ?? getMockDb();
  let activities = mockDb.interactionActivities.filter((activity) => {
    return activity.workspaceId === workspaceId;
  })
  activities = activities.filter((activity) => {
    const isActor =
      activity?.actorId === identityId;
    const actor = mockDb.identities.find((i) => i.id === activity?.actorId);
    const isActorCompany = actor?.companyId === identityId;

    const isNextReviewer =
      activity?.metadata.__typename ===
        "InteractionActivityMetadataRecord_Reviewer" &&
      activity.metadata.nextReviewer.identityId === identityId;

    const isDecisionMaker =
      activity?.metadata.__typename ===
        "InteractionActivityMetadataRecord_Decision" &&
      activity.metadata.decisionMakerId === identityId;

    return isActor || isActorCompany || isNextReviewer || isDecisionMaker;
  });

  const activityInteractionIds = new Set(
    activities
      .map((a) => a?.interactionId)
      .filter(Boolean) // Remove null/undefined IDs
  );

  let interactions = mockDb.interactions.filter((interaction) => {
    return interaction.workspaceId === workspaceId;
  })

  interactions = interactions.filter((interaction) => {
    const isPartyOrReviewer = 
        interaction.parties.some((p) => p?.identityId === identityId) || 
        interaction.currentReviewerId === identityId;

    // Check if this interaction is referenced by any filtered activity
    const isLinkedToActivity = activityInteractionIds.has(interaction.id);

    return isPartyOrReviewer || isLinkedToActivity;
  });

  return { activities, interactions}
}

function resolveIdentityStats(
  workspaceId: string, 
  identityId: string,
  options?: {
    db?: ReturnType<typeof getMockDb>;
  }
): IdentityStats {
  const mockDb = options?.db ?? getMockDb();
  const { activities, interactions } = getProfileInteractionsAndActivities(workspaceId, identityId, { db: mockDb });

  const lastActivityAt = activities.length
    ? Math.max(...activities.map(a => new Date(a.occurredAt).getTime()))
    : null;

  const total = interactions.length;
  const decidedCount = interactions.filter(
    (i) => i.status === "APPROVED" || i.status === "REJECTED",
  ).length;
  const active = total - decidedCount;

  const reviewerActivities = activities.filter(
    (activity) => activity.metadata.__typename === "InteractionActivityMetadataRecord_Reviewer"
  );
  const awaiting = reviewerActivities.filter(
    (activity) => (activity.metadata as InteractionActivityMetadataRecord_Reviewer)
    .nextReviewer.identityId === identityId).length;

  return {
    total,
    active,
    awaiting,
    lastActivityAt,
  }
}

export function resolveIdentity(
  identity: IdentityRecord, 
  options?: {
    role?: Role;
    db?: ReturnType<typeof getMockDb>;
  }): Identity & { stats: IdentityStats} {
  const mockDb = options?.db ?? getMockDb();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { companyId, ...resolvedIdentity } =  {
    ...identity,
    __typename: "Identity" as const,
    company: mockDb.identities.find((id: IdentityRecord) => id.id === identity.companyId),
    stats: resolveIdentityStats(identity.workspaceId, identity.id, { db: mockDb }),
  };

  return resolvedIdentity;
}

export function resolveInteraction(
    interaction: InteractionRecord, 
    options?: {
      role?: Role;
      db?: ReturnType<typeof getMockDb>;
    }
  ): Interaction {
  const currentRole = options?.role ?? useAppStore.getState().activeRole;
  const mockDb = options?.db ?? getMockDb();
  // Use that role to filter the buttons/actions
  const permittedActions = getPermittedActions(
    interaction.status,
    currentRole
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { creatorId, currentReviewerId, ...resolvedInteraction } =  {
    __typename: "Interaction" as const,
    ...interaction,
    creator: mockDb.identities.find((id: Identity) => id.id === interaction.creatorId)!,
    currentReviewer: mockDb.identities.find((id: Identity) => id.id === interaction.currentReviewerId) || null,
    notifications: [],
    activities: [],
    parties: interaction.parties.map((party: InteractionPartyRecord) => {
      const identity = mockDb.identities.find(
        (id: Identity) => id.id === party.identityId
      );

      if (!identity) return null;

      return ({
        role: party.role,
        identity,
      })
    }).filter((party): party is InteractionParty => party !== null),
  };

  return {
    ...resolvedInteraction,
    permittedActions,
  };
}

// Activity uses a reduced identity projection to simulate
// field-level selection and prevent unintended cache merging.
function projectIdentityForActivity(
  identityId: string
): Identity | null {
  const mockDb = getMockDb();
  const record = mockDb.identities.find(
    (id) => id.id === identityId
  );

  if (!record) return null;

  return {
    __typename: "Identity",
    id: record.id,
    workspaceId: record.workspaceId,
    name: record.name,
    type: record.type,
    status: record.status,
    country: record.country,
    createdAt: record.createdAt,
    company: record.companyId 
      ? (projectIdentityForActivity(record.companyId) ?? undefined) // Recursive call to ensure it's a full Identity
      : undefined,
  };
}

export function resolveInteractionActivity(interactionActivity: InteractionActivityRecord): InteractionActivity | null {
  switch (interactionActivity.metadata.__typename) {
    case 'InteractionActivityMetadataRecord_Reviewer': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { actorId, ...resolvedActivity } = {
        ...interactionActivity,
        __typename: "InteractionActivity" as const,
        actor: projectIdentityForActivity(interactionActivity.actorId)!,
        metadata: {
          ...interactionActivity.metadata,
          __typename: "InteractionActivityMetadata_Reviewer" as const,
          nextReviewer: {
            ...interactionActivity.metadata.nextReviewer,
            identity: projectIdentityForActivity((interactionActivity.metadata as InteractionActivityMetadataRecord_Reviewer).nextReviewer?.identityId)!,
          }
        },
      };
      return resolvedActivity;
      break;
    }

    case 'InteractionActivityMetadataRecord_Decision': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { actorId, ...resolvedActivity } = {
        ...interactionActivity,
        __typename: "InteractionActivity" as const,
        actor: projectIdentityForActivity(interactionActivity.actorId)!,
        metadata: {
          ...interactionActivity.metadata,
           __typename: "InteractionActivityMetadata_Decision" as const,
          decisionMaker: projectIdentityForActivity((interactionActivity.metadata as InteractionActivityMetadataRecord_Decision).decisionMakerId)!,
        },
      };
      return resolvedActivity;
      break;
    }

    case 'InteractionActivityMetadata_Created':
    case 'InteractionActivityMetadata_Comment':
    case 'InteractionActivityMetadata_Status': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { actorId, ...resolvedActivity } = {
        ...interactionActivity,
        __typename: "InteractionActivity" as const,
        actor: projectIdentityForActivity(interactionActivity.actorId)!,
        metadata: {
          ...interactionActivity.metadata,
        },
      };
      return resolvedActivity;
      break;
    }
  }
  return null;
}

// Match the text of multiple interaction properties to a search query
export function interactionMatchesQuery(
  interaction: Interaction,
  query: string
) {
  if (interaction.title.toLowerCase().includes(query)) return true;

  return interaction.parties.some((party) =>
    party.identity?.name.toLowerCase().includes(query)
  );
}