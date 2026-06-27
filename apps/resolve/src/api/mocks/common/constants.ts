import type { InteractionState, InteractionAction } from "../../../types/schema";

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