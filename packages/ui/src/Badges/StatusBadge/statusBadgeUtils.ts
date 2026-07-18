import React from "react";
import type { InteractionState } from "@resolve/types";
import IconApproved from "./icons/approved-aproved-confirm-2-svgrepo-com.svg?react";
import IconDenied from "./icons/denied-svgrepo-com.svg?react";
import IconPending from "./icons/pending-svgrepo-com.svg?react";
import IconClock from "./icons/icon-history.svg?react";
import { capitalize, toCamelCase } from "@resolve/utils";

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


export const sanitizeLabel = (label: string): string => {
  if (label.includes("_")) {
    return toCamelCase(label.toLowerCase());
  }
  return label.replace(/\s+/g, "-").replace(/_/g, "-").toLowerCase();
};

export const getStatusLabel = (status: string | null = ""): string => {
  return status ? capitalize(status.replace(/_/g, " ")) : "";
};


