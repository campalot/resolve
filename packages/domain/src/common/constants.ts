import type { 
  InteractionState, 
  InteractionAction, 
  InteractionActivityType, 
  InteractionActivity,
  InteractionActivityMetadata_Status,
  InteractionActivityMetadata_Reviewer,
  InteractionActivityMetadata_Decision,
  StatusChangeObj
} from "@resolve/types";

export const ASSET_BASE_URL = "http://localhost:3001";


// Workflow related types
type WorkflowConfig = {
  [K in InteractionState]: {
    allowedActions: InteractionAction[];
  };
};

export const WORKFLOW: WorkflowConfig = {
  DRAFT: {
    allowedActions: ["SUBMIT"],
  },
  IN_REVIEW: {
    allowedActions: ["APPROVE", "REJECT"],
  },
  APPROVED: {
    allowedActions: [],
  },
  REJECTED: {
    allowedActions: ["RESUBMIT"],
  },
};

export const activityTemplates: Record<
  InteractionActivityType,
  (activity: InteractionActivity) => string | StatusChangeObj
> = {
  INTERACTION_CREATED: (a) => `${a.actor.name} created this interaction`,

  STATUS_CHANGED: (a) => {
    const meta = a.metadata as InteractionActivityMetadata_Status;
    return {
      type: "STATUS_CHANGED",
      actorName: a.actor.name,
      newStatus: meta.newStatus,
    };
  },

  REVIEWER_ASSIGNED: (a) => {
    const meta = a.metadata as InteractionActivityMetadata_Reviewer;
    return `${meta.nextReviewer.identity.name} was assigned as reviewer`;
  },

  COMMENT_ADDED: (a) => `${a.actor.name} commented`,

  INTERACTION_DECIDED: (a) => {
    const meta = a.metadata as InteractionActivityMetadata_Decision;
    return `${a.actor.name} ${meta.finalStatus.toLowerCase()} this interaction`;
  },
};