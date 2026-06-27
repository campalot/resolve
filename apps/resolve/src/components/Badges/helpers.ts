import type { InteractionActivity } from "../../types/schema";
import type { InteractionActivityMetadata_Decision } from "../../types/schema";
import IconApproved from "../../assets/approved-aproved-confirm-2-svgrepo-com.svg?react";
import IconDenied from "../../assets/denied-svgrepo-com.svg?react";
import IconPending from "../../assets/pending-svgrepo-com.svg?react";
import IconClock from "../../assets/icon-history.svg?react";
import IconCheckmark from "../../assets/checkmark-svgrepo-com.svg?react";
import IconCancel from "../../assets/cancel-svgrepo-com.svg?react";
import IconComment from "../../assets/comment-text-svgrepo-com.svg?react";
import IconPlus from "../../assets/plus-circle-fill-svgrepo-com.svg?react";
import IconPerson from "../../assets/person-fill-svgrepo-com.svg?react";
import IconStatusChange from "../../assets/pending-filled-svgrepo-com.svg?react";
import type { InteractionState } from "../../types/schema";
import { capitalize, toCamelCase } from "../../helpers";

export type SvgIconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

export const StatusBadgeSize = {
  Medium: "medium", // 24px
  Small: "small", // 16px
}

export const ICON_MAP: Record<InteractionState, SvgIconComponent> = {
  APPROVED: IconApproved,
  REJECTED: IconDenied,
  IN_REVIEW: IconClock,
  DRAFT: IconPending,
};

export function getActivityIcon(activity: InteractionActivity) {
  switch (activity.type) {
    case "INTERACTION_DECIDED": {
      const status = (activity.metadata as InteractionActivityMetadata_Decision).finalStatus;
      return status === "APPROVED"
        ? IconCheckmark
        : IconCancel;
    }

    case "STATUS_CHANGED":
      return IconStatusChange;

    case "COMMENT_ADDED":
      return IconComment;

    case "REVIEWER_ASSIGNED":
      return IconPerson;

    case "INTERACTION_CREATED":
      return IconPlus;

    default:
      //return IconDot;
      return IconStatusChange;
  }
}

export const sanitizeLabel = (label: string): string => {
  if (label.includes("_")) {
    return toCamelCase(label.toLowerCase());
  }
  return label.replace(/\s+/g, "-").replace(/_/g, "-").toLowerCase();
};

export const getStatusLabel = (status: string | null = ""): string => {
  return status ? capitalize(status.replace(/_/g, " ")) : "";
};


