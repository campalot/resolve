import type { Interaction } from "@resolve/types";
import { ButtonType } from "../../components/Buttons/Button";
import { groupBy } from "../../helpers";

const STAGE_CONFIG: Record<InteractionStage, { label: string }> = {
  DRAFT: { label: "Draft" },
  IN_REVIEW: { label: "In Review" },
  APPROVED: { label: "Approved" },
  REJECTED: { label: "Rejected" },
};

export type InteractionStage =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type InteractionMetadataViewModel = {
  stage: {
    status: string;
    label: string;
    description?: string;
  };

  responsibility: {
    creator: string;
    currentReviewer?: string;
    decisionBy?: string;
  };

  participants: Array<{
    role: string;
    names: string[];
  }>;

  activity: {
    commentCount: number;
    eventCount: number;
  };

  lifecycle: {
    createdAt: string;
    updatedAt: string;
    finalizedAt?: string;
  };
};


export function buildInteractionMetadata(
  interaction: Interaction,
  eventTotal: number,
  commentsTotal: number
): InteractionMetadataViewModel {
  const { status, creator, currentReviewer, parties } = interaction;

  // --- Stage description logic ---
  let description: string | undefined;

  switch (status) {
    case "DRAFT":
      description = "Not yet submitted for review";
      break;
    case "IN_REVIEW":
      description = currentReviewer
        ? `Awaiting decision from ${currentReviewer.name}`
        : undefined;
      break;
    case "APPROVED":
      description = `Finalized on ${new Date(
        interaction.updatedAt
      ).toLocaleDateString()}`;
      break;
    case "REJECTED":
      description = `Closed on ${new Date(
        interaction.updatedAt
      ).toLocaleDateString()}`;
      break;
  }

  // --- Responsibility ---
  const responsibility =
    status === "APPROVED" || status === "REJECTED"
      ? {
          creator: creator.name,
          decisionBy: creator.name, // replace when real logic exists
        }
      : {
          creator: creator.name,
          currentReviewer: currentReviewer?.name,
        };

  // --- Participants ---
  const grouped = groupBy(parties, (p) => p.role);

  const participants = Object.entries(grouped).map(([role, items]) => ({
    role,
    names: items.map((p) => p.identity.name),
  }));

  return {
    stage: {
      status,
      // label: status.replace("_", " "),
      label: STAGE_CONFIG[status as InteractionStage].label,
      description,
    },
    responsibility,
    participants,
    activity: {
      commentCount: commentsTotal ?? 0,
      eventCount: eventTotal ?? 0,
    },
    lifecycle: {
      createdAt: new Date(interaction.createdAt).toLocaleString(),
      updatedAt: new Date(interaction.updatedAt).toLocaleString(),
      finalizedAt:
        status === "APPROVED" || status === "REJECTED"
          ? new Date(interaction.updatedAt).toLocaleString()
          : undefined,
    },
  };
}

export function buildInteractionToastMessage(
  interaction: Interaction,
  currentUserName: string,
  reviewerAdded?: boolean,
): string {
  const { status, currentReviewer } = interaction;
  const statusLabel = STAGE_CONFIG[status as InteractionStage].label
  let message: string

   switch (status) {
    case "IN_REVIEW":
      message = reviewerAdded && currentReviewer
        ? `${currentReviewer.name} assigned as reviewer`
        : `Interaction moved to ${statusLabel}`;
      break;
    case "APPROVED":
      message = `${currentUserName} ${status.toLowerCase()} this request`;
      break;
    case "REJECTED":
      message = `${currentUserName} ${status.toLowerCase()} this request`;
      break;

    default:
      message = "";
  }

  return message;
}

export const TRANSITION_METADATA: Record<string, { title: string; body: string; confirmLabel: string; type: (typeof ButtonType)[keyof typeof ButtonType] }> = {
  SUBMIT: { 
    title: "Submit for Review", 
    body: "This will lock the interaction and notify the assigned reviewer.", 
    confirmLabel: "Submit", 
    type: ButtonType.Primary 
  },
  APPROVE: { 
    title: "Approve Interaction", 
    body: "This will move the interaction to the Finalized state.", 
    confirmLabel: "Approve", 
    type: ButtonType.Primary 
  },
  REJECT: { 
    title: "Reject Interaction", 
    body: "This will move the interaction to the Rejected state, from which it can be resubmitted. Please ensure feedback has been provided.", 
    confirmLabel: "Reject", 
    type: ButtonType.Destructive 
  },
  RESUBMIT: { 
    title: "Resubmit for Review", 
    body: "Send the updated interaction back to the reviewer.", 
    confirmLabel: "Resubmit", 
    type: ButtonType.Primary 
  },
};
