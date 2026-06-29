import type { InteractionState, InteractionAction } from "./interaction";

export type Role = 'Admin' | 'Editor' | 'Viewer';

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

export const ACTION_TO_STATUS: Record<InteractionAction, InteractionState> = {
  SUBMIT: "IN_REVIEW",
  APPROVE: "APPROVED",
  REJECT: "REJECTED",
  RESUBMIT: "IN_REVIEW",
};

export const ROLE_PERMISSIONS: Record<Role, InteractionAction[]> = {
  Admin: ["SUBMIT", "APPROVE", "REJECT", "RESUBMIT"],
  Editor: ["SUBMIT", "RESUBMIT"],
  Viewer: [],
};